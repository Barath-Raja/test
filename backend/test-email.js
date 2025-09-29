import { sendReviewerCredentialsEmail } from './services/emailServices.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  try {
    console.log('Testing email service...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

    // Test email sending
    await sendReviewerCredentialsEmail(
      'test@example.com',
      'Test User',
      'testpassword123'
    );
    console.log('✅ Email test successful!');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
