const mongoose = require("mongoose");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const uri = "mongodb+srv://rabbifajracademy:rabbi.fajracademy@cluster0.c6bc0x0.mongodb.net/fajrtraining";

async function updateDb() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas!");

  // Use raw collection update to update curriculum
  const db = mongoose.connection.db;
  const coursesCollection = db.collection("courses");

  const { WOMEN_TOT_CURRICULUM, MEN_TOT_CURRICULUM } = require("../constant/course-defaults");

  const courses = await coursesCollection.find({}).toArray();
  console.log(`Found ${courses.length} courses in database.`);

  for (const c of courses) {
    const isMen = c.track === "men" || c.courseId === "TOT-MEN";
    const curriculum = isMen ? MEN_TOT_CURRICULUM : WOMEN_TOT_CURRICULUM;
    const instructor = isMen ? "হাফেজ মাওলানা মুহাম্মদ ফারাবী চৌধুরী" : "ফজর একাডেমি স্পেশাল ফ্যাকাল্টি টিম";
    const orientationDate = isMen ? "২০ সেপ্টেম্বর ২০২৬" : "২৩ আগস্ট ২০২৬";
    const orientationTime = isMen ? "রাত ৮:৩০ টা – ৯:৪৫ টা" : "রাত ৮:০০ টা – ৯:০০ টা";

    await coursesCollection.updateOne(
      { _id: c._id },
      {
        $set: {
          curriculum: curriculum,
          instructor: instructor,
          orientationDate: orientationDate,
          orientationTime: orientationTime,
        },
      }
    );
    console.log(`✓ Updated course "${c.courseId}" (${c.name}) with ${curriculum.length} official poster sessions!`);
  }

  await mongoose.disconnect();
  console.log("All courses successfully synced with official poster curriculum!");
}

updateDb().catch((e) => {
  console.error("Sync error:", e);
  process.exit(1);
});
