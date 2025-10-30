const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminSchema = require("../Scheema/AdminSceema");
const Admin = mongoose.model("singupadmin", AdminSchema); // Corrected model name
const saltRounds = 10;
const axios = require("axios");
const nodemailer = require("nodemailer");
const ScheduleScheema = require("../Scheema/ScheduleSchema ");
const Schedule = mongoose.model("schedule", ScheduleScheema); 
// Separate function to handle email sending
const sendScheduleEmail = (scheduleDetails) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: "islamnahidul0825@gmail.com", // Your email
      pass: "nmgt cvlr armv xdng", // Your app-specific password
    },
  });

  const subject = `New Meeting Scheduled: ${scheduleDetails?.date} at ${scheduleDetails?.time}`;
  const message = `
    আসসালামু আলাইকুম,

    A new meeting has been scheduled with the following details:

    Date: ${scheduleDetails?.date}
    Time: ${scheduleDetails?.time}
    Email: ${scheduleDetails?.email}
    Phone: ${scheduleDetails?.phone}
    Platform: ${scheduleDetails?.meetingPlatform}
    Description: ${scheduleDetails?.description}

    Thank you!
  `;

  const mailOptions = {
    from: "islamnahidul0825@gmail.com", 
    to: "nahidulislamsayel@gmail.com", // Send to your email
    subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending schedule email:", err.message || err);
    } else {
   
    }
  });
};

// POST route for logging in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Check if user exists in the database
    const user = await Admin.findOne({ email }); // Ensure 'email' matches correctly
    if (!user) {
      return res.status(401).json({ error: "Wrong username or password." });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Wrong username or password." });
    }

    // Generate token if email and password are valid
    const token = jwt.sign(
      {
        username: user.username,
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      access_token: token,
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error, please try again." });
  }
});

router.post("/schedule", async (req, res) => {
  try {
    const { date, time, email, phone, description, meetingPlatform, convertedTime } = req.body;

    if (!date || !time || !email || !phone || !meetingPlatform) {
      return res.status(400).json({ message: "All required fields must be filled!" });
    }

    const newSchedule = new Schedule({
      date,
      time,
      email,
      phone,
      description,
      meetingPlatform,
      convertedTime,
    });

    await newSchedule.save();
    sendScheduleEmail({
      date,
      time,
      email,
      phone,
      description,
      meetingPlatform,
    });
    res.status(201).json({ message: "Meeting scheduled successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error!", error });
  }
});
router.get("/getschedules", async (req, res) => {
  try {
    const schedules = await Schedule.find(); // Fetch all schedules from the database
   
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Server error!", error });
  }
});

module.exports = router;
