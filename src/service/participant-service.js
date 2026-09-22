import { dbConnect } from "@/service/mongo";
import { ParticipantModel } from "@/model/participant-model";
import { UserModel } from "@/model/user-model";
import { CourseModel } from "@/model/course-model";
import { PaymentModel } from "@/model/payment-model";

/**
 * Enrolls a user as a course participant.
 * Handles participant creation, course enrollment count increment,
 * and user enrollment link.
 */
export async function enrollUserInCourse({
  userId,
  userEmail,
  courseId,
  tranId = "",
  amount = 0,
  currency = "BDT",
  status = "active",
  paymentStatus = "paid",
  setRoleAsParticipant = false,
  notes = "",
}) {
  await dbConnect();

  // 1. Locate User
  let user = null;
  if (userId) {
    user = await UserModel.findById(userId);
  }
  if (!user && userEmail) {
    user = await UserModel.findOne({ email: userEmail.toLowerCase().trim() });
  }

  if (!user) {
    throw new Error("ব্যবহারকারী খুঁজে পাওয়া যায়নি।");
  }

  // 2. Resolve Course
  const resolvedCourseId = courseId || user.track || "TOT-MEN";
  let course = await CourseModel.findOne({
    $or: [{ courseId: resolvedCourseId }, { track: resolvedCourseId.toLowerCase() }],
  });

  if (!course) {
    // If not found by courseId, try finding by MongoDB ObjectId
    try {
      course = await CourseModel.findById(resolvedCourseId);
    } catch {
      // Ignore invalid ObjectId format
    }
  }

  const actualCourseId = course ? course.courseId : resolvedCourseId;
  const actualCourseName = course ? course.name : `TOT Training Batch (${actualCourseId})`;

  // 3. Resolve Payment if tranId exists
  let paymentRecord = null;
  if (tranId) {
    paymentRecord = await PaymentModel.findOne({ tranId });
  }

  // 4. Check if Participant already exists
  let participant = await ParticipantModel.findOne({
    user: user._id,
    courseId: actualCourseId,
  });

  if (participant) {
    // Update existing participant details
    participant.status = status || participant.status;
    participant.paymentStatus = paymentStatus || participant.paymentStatus;
    if (tranId) participant.tranId = tranId;
    if (amount) participant.paidAmount = amount;
    if (paymentRecord) participant.payment = paymentRecord._id;
    if (notes) participant.notes = notes;
    await participant.save();

    // Ensure user has reference
    if (course && !user.enrolledCourses?.includes(course._id)) {
      user.enrolledCourses = user.enrolledCourses || [];
      user.enrolledCourses.push(course._id);
    }
    if (!user.enrolledCourseIds?.includes(actualCourseId)) {
      user.enrolledCourseIds = user.enrolledCourseIds || [];
      user.enrolledCourseIds.push(actualCourseId);
    }
    if (setRoleAsParticipant && user.role !== "admin" && user.role !== "instructor") {
      user.role = "participant";
    }
    await user.save();

    return {
      isNew: false,
      participant,
      course,
      user,
    };
  }

  // 5. Create NEW Participant record
  participant = await ParticipantModel.create({
    user: user._id,
    course: course ? course._id : null,
    courseId: actualCourseId,
    courseName: actualCourseName,
    userEmail: user.email,
    userName: user.fullName,
    phone: user.phone || "",
    track: user.track || actualCourseId,
    gender: user.gender || "male",
    status,
    paymentStatus,
    payment: paymentRecord ? paymentRecord._id : null,
    tranId,
    paidAmount: Number(amount) || user.paidAmount || 0,
    currency,
    enrolledAt: new Date(),
    progress: 0,
    attendanceCount: 0,
    notes,
  });

  // 6. Increment course enrolledCount
  if (course) {
    await CourseModel.findByIdAndUpdate(course._id, {
      $inc: { enrolledCount: 1 },
    });
  }

  // 7. Update User model references
  if (course) {
    user.enrolledCourses = user.enrolledCourses || [];
    if (!user.enrolledCourses.includes(course._id)) {
      user.enrolledCourses.push(course._id);
    }
  }
  user.enrolledCourseIds = user.enrolledCourseIds || [];
  if (!user.enrolledCourseIds.includes(actualCourseId)) {
    user.enrolledCourseIds.push(actualCourseId);
  }
  if (setRoleAsParticipant && user.role !== "admin" && user.role !== "instructor") {
    user.role = "participant";
  }
  user.enrolledAt = user.enrolledAt || new Date();
  await user.save();

  return {
    isNew: true,
    participant,
    course,
    user,
  };
}
