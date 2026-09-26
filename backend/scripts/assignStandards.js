require("dotenv").config();

const mongoose = require("mongoose");
const Student = require("../models/Student");

const MONGO_URI = process.env.MONGO_URI;

const assignStandards = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing. Check your .env file."
      );
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    const students = await Student.find({})
      .select("_id studentId")
      .sort({ studentId: 1 })
      .lean();

    console.log(
      `Found ${students.length} students`
    );

    let class8 = 0;
    let class9 = 0;
    let class10 = 0;

    for (let i = 0; i < students.length; i++) {
      let standard;

      if (i % 3 === 0) {
        standard = "8";
        class8++;
      } else if (i % 3 === 1) {
        standard = "9";
        class9++;
      } else {
        standard = "10";
        class10++;
      }

      await Student.updateOne(
        {
          _id: students[i]._id
        },
        {
          $set: {
            standard
          }
        }
      );

      console.log(
        `${students[i].studentId} → Class ${standard}`
      );
    }

    console.log(
      "--------------------------------"
    );

    console.log(
      `Class 8  : ${class8}`
    );

    console.log(
      `Class 9  : ${class9}`
    );

    console.log(
      `Class 10 : ${class10}`
    );

    console.log(
      "--------------------------------"
    );

    console.log(
      "Standards assigned successfully."
    );

    await mongoose.disconnect();

  } catch (error) {
    console.error(
      "Error:",
      error.message
    );

    await mongoose.disconnect();

    process.exit(1);
  }
};

assignStandards();