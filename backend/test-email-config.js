import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testEmailConfig() {
  console.log('=== EMAIL CONFIGURATION TEST ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n❌ Email credentials not configured in .env file');
    console.log('Please add the following to backend/.env:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    return;
  }

  console.log('\n=== TESTING EMAIL CONNECTION ===');

  const transporter = nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection successful');

    // Test sending email
    const mailOptions = {
      from: `"NEC Conference Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "Email Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E86C1;">Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p>If you received this email, your email service is configured correctly!</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);

    if (error.code === 'EAUTH') {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Enable 2-Factor Authentication on your Google account');
      console.log('3. Generate an App Password: https://support.google.com/accounts/answer/185833');
      console.log('4. Use the 16-character App Password as EMAIL_PASS in your .env file');
    }
  }
}

testEmailConfig();
