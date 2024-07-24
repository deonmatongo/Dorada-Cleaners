require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')), function(req, res, next) {
    console.log('Serving static files:', req.path);
    next();
});

app.get('/request-quote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'requestQuote.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.post('/submit', async (req, res) => {
    let { name, phone, email, postcode, service, date, time, info, disclaimer } = req.body;
    
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: 'New Form Submission',
        text: `Form submission details:
Name: ${name}
Phone: ${phone}
Email: ${email}
Postcode: ${postcode}
Service: ${service}
Date: ${date}
Time: ${time}
Additional Information: ${info}
Disclaimer Accepted: ${disclaimer ? 'Yes' : 'No'}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'Error sending email', error: error.toString() });
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ message: 'Form submitted successfully' });
        }
    });
});

app.post('/api/orders', async (req, res) => {
    console.log("Received order submission: ", req.body);
    const { personalDetails, cartItems } = req.body;

    let emailText = `Order Summary:\n\nPersonal Details:\nName: ${personalDetails.name}\nPhone: ${personalDetails.phone}\nEmail: ${personalDetails.email}\nAddress: ${personalDetails.address}\nDate: ${personalDetails.date}\nTime: ${personalDetails.time}\n\nOrder Details:\n`;

    cartItems.forEach(item => {
        emailText += `${item.quantity}x ${item.name} - PLN${item.price} each, Total: PLN${item.total}\n`;
    });

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
        
    });

    try {
        await transporter.sendMail({
            from: `"Dorada" <${process.env.EMAIL}>`,
            to: process.env.EMAIL,
            subject: "Order Summary",
            text: emailText,
        });

        res.send({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).send({ message: 'Failed to send email' });
    }
});

app.use(express.static('public'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});
