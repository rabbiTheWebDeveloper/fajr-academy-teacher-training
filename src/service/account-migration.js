/**
 * One-time split of the old single "users" collection into three:
 *   users        → admins (stay)
 *   instructors  → role "instructor"
 *   tots         → trainees (teacher / student / participant, or no role)
 *
 * Each document is copied with the SAME _id, so participants, evaluations, payments and
 * sessions that point at it stay valid, and existing login tokens keep working.
 * Raw driver only (no models) so it can run inside dbConnect() without import cycles.
 * Idempotent and safe when several server instances run it at the same time.
 */
const TRAINEE_ROLES = ["teacher", "student", "participant"];

const MOVES = [
  { label: "instructors", target: "instructors", filter: { role: "instructor" } },
  {
    label: "tots",
    target: "tots",
    filter: { $or: [{ role: { $in: TRAINEE_ROLES } }, { role: { $exists: false } }, { role: null }, { role: "" }] },
  },
];

export async function migrateAccountCollections(db) {
  const users = db.collection("users");
  const summary = {};

  for (const move of MOVES) {
    const target = db.collection(move.target);
    let moved = 0;
    let skipped = 0;

    for await (const doc of users.find(move.filter)) {
      let present = await target.findOne({ _id: doc._id }, { projection: { _id: 1 } });
      if (!present) {
        const clash = await target.findOne({ email: doc.email }, { projection: { _id: 1 } });
        if (clash) {
          // A different account already owns this e-mail in the new collection: leave the
          // old document where it is for an admin to resolve, never overwrite.
          console.warn(`[accounts] not moving ${doc.email}: ${move.target} already has an account with this e-mail`);
          skipped++;
          continue;
        }
        const copy = { ...doc };
        if (move.target === "tots" && !TRAINEE_ROLES.includes(copy.role)) copy.role = "teacher";
        try {
          await target.insertOne(copy);
          present = true;
        } catch (err) {
          if (err?.code !== 11000) throw err;
          // Another instance moved it first (same _id) — or an e-mail race; re-check.
          present = await target.findOne({ _id: doc._id }, { projection: { _id: 1 } });
          if (!present) {
            skipped++;
            continue;
          }
        }
      }
      await users.deleteOne({ _id: doc._id });
      moved++;
    }

    if (moved || skipped) summary[move.label] = { moved, skipped };
  }

  if (Object.keys(summary).length) console.log("[accounts] split legacy users into collections:", JSON.stringify(summary));
  return summary;
}
