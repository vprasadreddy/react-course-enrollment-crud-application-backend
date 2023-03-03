const express = require("express");
const jwt = require("jsonwebtoken");

let authenticate = (req, res, next) => {
  const token = req.header("x-access-token");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Access Denied" });
  }

  //verify the token
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded.user;
    next();
  } catch (error) {}
};

module.exports = authenticate;
