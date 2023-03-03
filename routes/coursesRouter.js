const { application } = require("express");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Course = require("../models/Course");
const { v4: uuidv4 } = require("uuid");
const { body, check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");

//get all Courses
router.get("/", async (req, res) => {
  let courses = await Course.find();
  res.send(courses);
});

//get active Courses
router.get("/activeCourses", async (req, res) => {
  let courses = await Course.find({ isActive: true });
  res.send(courses);
});

router.post(
  "/add",
  authenticate,
  [check("name").notEmpty().withMessage("Course name is required")],
  async (req, res) => {
    const { name } = req.body;
    let courseid = uuidv4();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let isAdmin = req.user.isAdmin;
      if (isAdmin) {
        try {
          let course = await Course.findOne({
            name,
          });
          if (course) {
            return res.status(400).json({ message: "course already exists" });
          }
          let newCourse = new Course({
            name,
            courseid,
          });
          let savedCourse = await newCourse.save();
          return res.status(200).json({
            message: "Course added successfully",
            course: savedCourse,
          });
        } catch (error) {
          return res.status(400).json({ message: error });
        }
      } else {
        return res
          .status(401)
          .json({ message: `User is not authorized to add the course` });
      }
    }
  }
);

//update Course
// { new: true } should be passed as an option to get the updated product as response.
router.put(
  "/updatecourse",
  authenticate,
  [
    check("_id").notEmpty().withMessage("_id is required"),
    check("name").notEmpty().withMessage("name is required"),
    check("isActive")
      .notEmpty()
      .withMessage("isActive boolean value is required"),
  ],
  async (req, res) => {
    let isAdmin = req.user.isAdmin;
    if (isAdmin) {
      try {
        let { name, isActive, _id } = req.body;
        const filter = { _id };
        let updatedCourse = {
          name,
          isActive,
        };
        const options = { new: true };
        let isCoursePresent = await Course.findOne(filter);
        if (isCoursePresent) {
          let course = await Course.findOneAndUpdate(
            filter,
            updatedCourse,
            options
          );
          return res.status(200).json({
            message: "Course updated successfully",
            course,
          });
        } else {
          return res.status(400).json({
            message: `Couldn't find Course with name: ${name}`,
            name,
            isActive,
            _id,
          });
        }
      } catch (error) {
        return res.status(400).json({ message: error });
      }
    } else {
      return res
        .status(401)
        .json({ message: `User is not authorized to update the course` });
    }
  }
);

//delete course
router.delete(
  "/deletecourse",
  authenticate,
  [check("courseid").notEmpty().withMessage("courseid is required")],
  async (req, res) => {
    const { courseid } = req.body;
    let isAdmin = req.user.isAdmin;
    if (isAdmin) {
      try {
        if (courseid) {
          let course = await Course.findOne({
            courseid,
          });
          if (course) {
            let deletedCourse = await Course.findOneAndDelete(
              { courseid },
              { $set: { isActive: false } },
              { new: true }
            );
            return res.status(200).json({
              message: "Course deleted successfully",
              course: deletedCourse,
            });
          } else {
            return res.status(400).json({
              message: `Couldn't find Course with name: ${courseid}`,
            });
          }
        } else {
          return res
            .status(400)
            .json({ message: `Course name cannot be empty` });
        }
      } catch (error) {
        return res.status(400).json({ message: error });
      }
    } else {
      return res
        .status(401)
        .json({ message: `User is not authorized to delete the course` });
    }
  }
);
module.exports = router;
