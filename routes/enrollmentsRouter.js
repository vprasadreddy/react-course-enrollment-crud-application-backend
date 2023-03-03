const { application } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { body, check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");

//View my enrollments
router.get("/viewMyEnrollments", authenticate, async (req, res) => {
  let userid = req.user.id;
  let enrollment = await Enrollment.find({
    userid,
  }).populate("courseid", "name courseid");
  res.status(200).send(enrollment);
});

//Enroll in a course
router.post("/enrollCourse", authenticate, async (req, res) => {
  let userid = req.user.id;
  let user = req.user.name;
  let email = req.user.email;
  //console.log(req.user);
  let { courseid } = req.body;
  let courseObjectId = mongoose.Types.ObjectId(courseid);
  //console.log(courseid);
  try {
    let isCourseAlreadyEnrolled = await Enrollment.find({ userid, courseid });
    let course = await Course.findById({ _id: courseObjectId });
    let courseName;
    if (course) {
      courseName = course.name;
    }
    if (isCourseAlreadyEnrolled.length > 0) {
      res.status(400).json({
        message: "Course already enrolled for the user",
        course: { courseid, courseName, user, email },
      });
    } else {
      let enrollment = new Enrollment({
        userid,
        courseid,
      });
      let enrolledCourse = await enrollment.save();
      res
        .status(200)
        .json({ message: "Course enrolled successfully!!!", enrolledCourse });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

//Delete enrollment
router.delete("/deleteEnrollment", authenticate, async (req, res) => {
  let userid = req.user.id;
  let username = req.user.name;
  let email = req.user.email;
  //console.log(req.user);
  let { courseid } = req.body;
  let courseObjectId = mongoose.Types.ObjectId(courseid);
  try {
    let enrolledCourse = await Enrollment.findOne({
      userid,
      courseid,
    });
    if (enrolledCourse) {
      let deletedCourse = await Enrollment.findOneAndDelete({
        userid,
        courseid,
      });
      return res.status(200).json({
        message: "Enrollment deleted successfully",
        enrollment: deletedCourse,
      });
    } else {
      return res.status(400).json({
        message: `Couldn't find the enrollment for the user: ${username} with course id: ${courseid} to delete.`,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

module.exports = router;
