import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Configure transporter specifically for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // e.g., your.email@gmail.com
      pass: process.env.EMAIL_PASSWORD, // Must be an App Password, NOT your regular password
    },
  });

  const mailOptions = {
    from: 'Campus Recruitment System <your.email@gmail.com>', // Best practice: match your auth user
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
