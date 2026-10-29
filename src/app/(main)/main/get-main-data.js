import { dbConnect } from '@/service/mongo'
import { CourseModel, DEFAULT_TOT_CURRICULUM } from '@/model/course-model'
import { SettingModel } from '@/model/setting-model'
import { UserModel } from '@/model/user-model'
import { DEFAULT_INSTRUCTORS } from '@/constant/instructor-defaults'

/* ------------------------------------------------------------------ */
/*  Fallbacks — mirror the marketing landing page so both stay in sync */
/*  when the database is empty or unreachable.                          */
/* ------------------------------------------------------------------ */
const DEFAULT_SETTINGS = {
  instituteName: 'Fajr Academy',
  coursePrice: 1000,
  regularCoursePrice: 2500,
  currentBatch: 'BATCH 2026',
  admissionStatus: 'open', // 'open' | 'waitlist' | 'closed'
  orientationDate: '২০ ও ২১ সেপ্টেম্বর ২০২৬',
  orientationTime: 'রাত ৮:০০ টা – ৯:৩০ টা',
  bkashMerchantNumber: '01410764581',
  helplinePhone: '01410764581',
  supportEmail: 'support@fajracademy.io',
  whatsappSupport: 'https://wa.me/8801410764581',
}

const SHARED_PERKS = [
  'মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত',
  '৪টি প্রফেশনাল প্যাকেজ: ইসলামিক পেডাগগি ও শিক্ষাদানের কৌশল',
  'অভিজ্ঞ ট্রেনার: বিশেষ আলোচনা ও আন্তর্জাতিক শিক্ষাবিদ',
  'সার্টিফিকেট প্রদান: কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট',
]

// Plain JSON so Mongo ObjectIds / Dates never leak into rendered props.
const toPlain = (value) => JSON.parse(JSON.stringify(value))

export async function getMainPageData() {
  let courses = []
  let settingsDoc = null
  let instructorDocs = []

  try {
    await dbConnect()
    ;[courses, settingsDoc, instructorDocs] = await Promise.all([
      CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean(),
      SettingModel.findOne({ key: 'system_settings' }).lean(),
      UserModel.find({ role: { $in: ['instructor', 'admin'] }, isActive: { $ne: false } })
        .sort({ rating: -1, experienceYears: -1 })
        .select('fullName designation specialization bio experienceYears rating avatar')
        .limit(6)
        .lean(),
    ])
  } catch (err) {
    console.error('Error fetching /main page data:', err)
  }

  courses = toPlain(courses || [])
  const settings = { ...DEFAULT_SETTINGS, ...(settingsDoc ? toPlain(settingsDoc) : {}) }
  const coursePrice = settings.coursePrice || 1000
  const regularPrice = settings.regularCoursePrice || 2500

  const menCourse = courses.find((c) => c.track === 'men' || c.courseId === 'TOT-MEN') || {
    name: 'Training of Trainers (TOT) - MEN BATCH',
    tag: 'MEN BATCH',
    fee: coursePrice,
    regularFee: regularPrice,
    orientationDate: '২০ সেপ্টেম্বর ২০২৬',
    orientationTime: 'রাত ৮:০০ টা – ৯:৩০ টা',
    summary: 'ছেলেদের জন্য ঘরে বসে কুরআন শিক্ষার সুযোগ ও আধুনিক পদ্ধতি',
    perks: [...SHARED_PERKS, 'Training & Grooming: নিয়মিত ক্যারিয়ার প্রোগ্রেসের সুযোগ'],
  }

  const womenCourse = courses.find((c) => c.track === 'women' || c.courseId?.includes('WOMEN')) || {
    name: 'Training of Trainers (TOT) - WOMEN BATCH',
    tag: 'WOMEN BATCH 014',
    fee: coursePrice,
    regularFee: regularPrice,
    orientationDate: '২১ সেপ্টেম্বর ২০২৬',
    orientationTime: 'রাত ৮:০০ টা – ৯:৩০ টা',
    summary: 'নিজের ঘরে থেকেই আন্তর্জাতিক মানের অনলাইন কুরআন শিক্ষার সুযোগ',
    perks: [...SHARED_PERKS, 'পর্দা ও শৃঙ্খলার সুরক্ষা: ১০০% ঘরে বসেই পাঠদানের সুযোগ'],
  }

  const curriculum = menCourse.curriculum?.length > 0 ? menCourse.curriculum : DEFAULT_TOT_CURRICULUM

  const instructors = (instructorDocs?.length > 0 ? toPlain(instructorDocs) : DEFAULT_INSTRUCTORS).map((i) => ({
    fullName: i.fullName,
    designation: i.designation,
    specialization: i.specialization,
    experienceYears: i.experienceYears,
    rating: i.rating,
    avatar: i.avatar || '',
  }))

  const helplinePhone = settings.helplinePhone || DEFAULT_SETTINGS.helplinePhone
  const cleanPhone = helplinePhone.replace(/[^0-9]/g, '')
  const intlPhone = cleanPhone.startsWith('880') ? cleanPhone : `88${cleanPhone.replace(/^0/, '')}`
  const whatsappUrl =
    settings.whatsappSupport ||
    `https://wa.me/${intlPhone}?text=${encodeURIComponent(
      'আসসালামু আলাইকুম, কুরআন টিচার ট্রেনিং কোর্স সম্পর্কে জানতে চাই।'
    )}`

  return {
    settings,
    coursePrice,
    regularPrice,
    menCourse,
    womenCourse,
    curriculum,
    instructors,
    helplinePhone,
    whatsappUrl,
  }
}
