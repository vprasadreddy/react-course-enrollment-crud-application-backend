const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    courseid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Enrollment = mongoose.model("enrollment", enrollmentSchema);
module.exports = Enrollment;
