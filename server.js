const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ========================
   Middleware
======================== */
app.use(cors({
    origin: [
        "https://health-roan-omega.vercel.app",
        "https://clinic-three-tau.vercel.app/",
        "http://localhost:5173"
    ],
    credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

/* ========================
   Nodemailer Transporter
   (FIXED CONFIG)
======================== */
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // MUST be true for Gmail
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD // Gmail App Password (16 chars)
    },
    tls: {
        rejectUnauthorized: false
    }
});

/* ========================
   Verify Email Transport
======================== */
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email server error:", error);
    } else {
        console.log("✅ Email server is ready");
    }
});

/* ========================
   API Route
======================== */
app.post("/send-email", async (req, res) => {
    const { name, email, phone, date, time, guests, requests } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: "Required fields missing"
        });
    }

    try {
        await transporter.sendMail({
            from: `"Clinic Appointment" <${process.env.EMAIL}>`,
            to: process.env.EMAIL,
            replyTo: email,
            subject: "🍽️ New CLinic Appointment",
            html: `
                <h2>New Reservation Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Guests:</strong> ${guests}</p>
                <p><strong>Special Requests:</strong> ${requests || "None"}</p>
                <hr />
                <p>📍 Sent from clinic website</p>
            `
        });

        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });

    } catch (error) {
        console.error("❌ Email sending error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send email"
        });
    }
});

/* ========================
   Server Start
======================== */
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
