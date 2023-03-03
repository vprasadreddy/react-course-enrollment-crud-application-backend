//configure dotenv
require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

//configure cors
app.use(cors());

//configure expresss to receive form data
app.use(express.json());

//Database connection to MongoDB
//No need to mention useFindAndModify: false, useCreateIndex: true in Mongoose version 6
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((response) => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

const userRouter = require("./routes/userRouter");
const coursesRouter = require("./routes/coursesRouter");
const enrollmentsRouter = require("./routes/enrollmentsRouter");
//router configuration
app.use("/api/users", userRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);

// const hostname = process.env.LOCAL_HOSTNAME;
const port = process.env.PORT || 9999;

app.listen(port, () => {
  console.log(`Server has started!!! at port: ${port}`);
});

//development
app.get("/", (req, res) => {
  return res.send("Received a GET HTTP method");
});

if (process.env.NODE_ENV === "production") {
  app.get("/", (req, res) => {
    return res.send("Received a GET HTTP method");
    // app.use(express.static(path.resolve(__dirname, "client", "build")));
    // res.json({ title: "hello" });
    // res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
