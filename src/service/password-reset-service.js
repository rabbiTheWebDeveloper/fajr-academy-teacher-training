import { createHash, randomBytes } from "node:crypto";
import { dbConnect } from "@/service/mongo";
import { findAccount, modelForType } from "@/service/account-service";
import { findUserByIdentifier } from "@/queries/auth-queries";
import { getAppUrl } from "@/lib/sslcommerz";
import { sendPasswordResetEmail } from "@/utlis/mail";

/**
 * "Forgot password" for all three account collections (users · instructors · tots).
 *
 * A random single-use token is e-mailed as a link; only its SHA-256 hash is stored
 * (resetPasswordToken / resetPasswordExpires), so a database leak can't be used to
 * reset anyone's password.
 */
export const RESET_TTL_MINUTES = 30;

const hashToken = (token) => createHash("sha256").update(String(token)).digest("hex");

// These writes must not bump `updatedAt`: the login flow compares it with a payment's
// finalizedAt to self-heal trainees whose provisioning crashed midway.
const QUIET = { timestamps: false };

/** ra***@gmail.com — enough for the owner to recognise the inbox, not enough to learn it. */
function maskEmail(email) {
  const [local, domain] = String(email || "").split("@");
  if (!local || !domain) return "";
  return `${local.slice(0, Math.min(2, Math.max(1, local.length - 1)))}***@${domain}`;
}

/**
 * Start a reset for the account matching an e-mail / phone number.
 * → { status: "sent", maskedEmail } | { status: "not_found" | "inactive" | "mail_failed" }
 */
export async function requestPasswordReset(identifier) {
  const user = await findUserByIdentifier(identifier);
  if (!user?.email) return { status: "not_found" };
  if (user.isActive === false) return { status: "inactive" };

  const Model = modelForType(user.accountType);
  const token = randomBytes(32).toString("base64url");
  await Model.updateOne(
    { _id: user._id },
    {
      $set: {
        resetPasswordToken: hashToken(token),
        resetPasswordExpires: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000),
      },
    },
    QUIET
  );

  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

  if (!process.env.GMAIL_APP_PASSWORD) {
    // Local development without mail credentials: the link is only ever printed here.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[password-reset] ${user.email} → ${resetUrl}`);
      return { status: "sent", maskedEmail: maskEmail(user.email) };
    }
    return { status: "mail_failed" };
  }

  try {
    await sendPasswordResetEmail({
      toEmail: user.email,
      fullName: user.fullName,
      resetUrl,
      minutes: RESET_TTL_MINUTES,
    });
  } catch (err) {
    console.error("Password reset mail error:", err.message);
    return { status: "mail_failed" };
  }

  return { status: "sent", maskedEmail: maskEmail(user.email) };
}

async function findByResetToken(token, select) {
  if (typeof token !== "string" || token.length < 20 || token.length > 200) return null;
  return findAccount(
    { resetPasswordToken: hashToken(token), resetPasswordExpires: { $gt: new Date() } },
    { select }
  );
}

/** Is this reset link still usable? */
export async function isResetTokenValid(token) {
  return Boolean(await findByResetToken(token, "_id"));
}

/**
 * Set a new password with a reset token. The token is consumed, and every stored
 * session of the account is invalidated.
 * → { success: true, email } | { success: false }
 */
export async function resetPasswordWithToken(token, newPassword) {
  const found = await findByResetToken(token, "_id email");
  if (!found) return { success: false };

  const Model = modelForType(found.type);
  // Matching on the token again makes the link single-use even under concurrent requests.
  // The plain password is hashed by the schema's updateOne hook (see account-schema.js).
  const res = await Model.updateOne(
    { _id: found.account._id, resetPasswordToken: hashToken(token) },
    {
      $set: { password: newPassword },
      $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
    },
    QUIET
  );
  if (!res.modifiedCount) return { success: false };

  try {
    await dbConnect();
    const { SessionModel } = await import("@/model/session-model");
    await SessionModel.updateMany({ userId: found.account._id }, { isValid: false });
  } catch (err) {
    console.warn("Session invalidation after reset:", err.message);
  }

  return { success: true, email: found.account.email };
}
