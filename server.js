require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

const app = express();
const PORT = 3000;
const mongoose = require('mongoose');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-writers', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    university: String,
    year: String,
    semester: String,
    phone: String,
    email: String,
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Email Configuration
// IMPORTANT: Credentials are now loaded from the .env file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Set in .env
        pass: process.env.EMAIL_PASS  // Set in .env
    }
});

app.post('/send-email', (req, res) => {
    const { name, phone, email } = req.body;

    // 1. Email to the Owner (You)
    const mailOptionsOwner = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Inquiry from ${name} - Fortune Writers`,
        html: `
            <h2>New Client Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p>Please contact them soon.</p>
        `
    };

    // 2. Email to the User (Thank You)
    const mailOptionsUser = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank You for Choosing Fortune Writers',
        html: `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0c10; color: #ffffff; border-radius: 10px; overflow: hidden;">
                <!-- Header Image Placeholer -->
                <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #66fcf1 0%, #45a29e 100%); display: flex; align-items: center; justify-content: center;">
                    <h1 style="color: #0b0c10; font-size: 28px;">Fortune Writers</h1>
                </div>
                
                <div style="padding: 30px;">
                    <h2 style="color: #66fcf1; margin-bottom: 20px;">Thank You for Reaching Out!</h2>
                    <p style="color: #c5c6c7; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
                    <p style="color: #c5c6c7; font-size: 16px; line-height: 1.6;">
                        We appreciate you contacting Fortune Writers. We have received your details and our team is already reviewing your inquiry.
                    </p>
                    <p style="color: #c5c6c7; font-size: 16px; line-height: 1.6;">
                        We will contact you shortly to discuss how we can help you achieve your goals. We hope to deliver the expected results for you very soon.
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1f2833; text-align: center;">
                        <p style="color: #45a29e; font-size: 14px;">Fortune Writers | Premium Services</p>
                        <p style="color: #45a29e; font-size: 14px;">+91 6397841399</p>
                    </div>
                </div>
            </div>
        `
    };

    // Send emails
    transporter.sendMail(mailOptionsOwner, (error, info) => {
        if (error) {
            console.log('Error sending to owner:', error);
            // Don't fail the request yet, try sending to user
        } else {
            console.log('Email sent to owner: ' + info.response);
        }
    });

    transporter.sendMail(mailOptionsUser, (error, info) => {
        if (error) {
            console.log('Error sending to user:', error);
            return res.status(500).json({ success: false, message: 'Failed to send confirmation email' });
        } else {
            console.log('Email sent to user: ' + info.response);
            return res.status(200).json({ success: true, message: 'Emails sent successfully' });
        }
    });
});


app.post('/submit-details', async (req, res) => {
    try {
        const { name, university, year, semester, phone, email } = req.body;

        const newUser = new User({
            name,
            university,
            year,
            semester,
            phone,
            email
        });

        await newUser.save();
        res.status(200).json({ success: true, message: 'Details saved successfully' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ success: false, message: 'Failed to save details' });
    }
});

// Export for Netlify
module.exports.handler = serverless(app);

// Local Development
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
