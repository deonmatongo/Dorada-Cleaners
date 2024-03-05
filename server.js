require('dotenv').config();


const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 8000;


app.use(cors({
    origin: [
        'https://localhost:8000', // Add this line to allow requests from your local development server
        'https://dinastiadorada.com.pl',
        'https://www.dinastiadorada.com.pl',
        
    ],
    credentials: true, // You might need this line if you're sending cookies or using session authentication
    methods: ['GET', 'POST'], // Ensure you allow the HTTP methods you are using
}));
const corsOptions = {
    origin: 'https://localhost:8000', // or use '*' to allow any origin - not recommended for production
    methods: ['GET', 'POST'], // Allow only the methods you need
    allowedHeaders: ['Content-Type'] // Allow only the headers you need
  };
  
  app.use(cors(corsOptions));

// app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')), function(req, res, next) {
    console.log('Serving static files:', req.path);
    next();
});

// Serve the requestQuote.html page
app.get('/request-quote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'requestQuote.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});



// Endpoint to handle form submission
app.post('/submit', async (req, res) => {
    let { name, phone, email, postcode, service, date, time, info, disclaimer } = req.body;
    
    // Initialize nodemailer transporter
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL, // Provided Gmail address
            pass: process.env.PASSWORD // Provided password
        },
    });

    // Email options
    let mailOptions = {
        from: 'danielngwerewe@dinastiadorada.com.pl', // Sender address
        to: 'danielngwerewe@dinastiadorada.com.pl', // List of recipients
        subject: 'New Form Submission', // Subject line
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

    // Attempt to send the email
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
    const { personalDetails, cartItems } = req.body;

    // Construct the email body
    let emailText = `Order Summary:\n\nPersonal Details:\nName: ${personalDetails.name}\nPhone: ${personalDetails.phone}\nEmail: ${personalDetails.email}\nAddress: ${personalDetails.address}\nDate: ${personalDetails.date}\nTime: ${personalDetails.time}\n\nOrder Details:\n`;

    cartItems.forEach(item => {
        emailText += `${item.quantity}x ${item.name} - PLN${item.price} each, Total: PLN${item.total}\n`;
    });

    // Configure the SMTP transporter using the provided credentialsą
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL, // Provided Gmail address
            pass: process.env.PASSWORD // Provided password
        },
    });

    // Send email using the provided details
    try {
        await transporter.sendMail({
            from: '"Dorada" <danielngwerewe@dinastiadorada.com.pl', // sender address
            to: "danielngwerewe@dinastiadorada.com.pl", // list of receivers, using the same address for simplicity
            subject: "Order Summary", // Subject line
            text: emailText, // plain text body
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
