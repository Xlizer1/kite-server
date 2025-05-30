const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL;
    
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY not configured');
      return;
    }
    
    if (!this.fromEmail) {
      console.error('❌ FROM_EMAIL not configured');
      return;
    }
    
    console.log(`📧 Email service configured with sender: ${this.fromEmail}`);
  }

  // Send any email
  async sendEmail(to, subject, htmlContent, textContent = '') {
    const msg = {
      to: to,
      from: this.fromEmail,
      subject: subject,
      text: textContent || this.stripHtml(htmlContent),
      html: htmlContent
    };

    try {
      console.log(`📤 Sending email to: ${to}`);
      const response = await sgMail.send(msg);
      
      console.log(`✅ Email sent successfully to: ${to}`);
      return { 
        success: true, 
        messageId: response[0].headers['x-message-id'] 
      };
      
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // Send password reset email - THIS REPLACES YOUR FAILING FUNCTION
  async sendPasswordResetEmail(userEmail, resetLink) {
    const subject = 'Reset Your Password';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px;">
            You requested to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #667eea; 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block; 
                      font-weight: bold;">
              Reset My Password
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ <strong>Security Notice:</strong><br>
              • This link expires in 1 hour<br>
              • If you didn't request this, ignore this email<br>
              • Never share this link with anyone
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy this link:<br>
            <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName) {
    const subject = `Welcome ${userName}! 🎉`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome ${userName}! 🎉</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 18px; margin-top: 0;">
            Thank you for joining our platform!
          </p>
          
          <p style="color: #666; font-size: 16px;">
            We're excited to have you on board. Here's what you can do next:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🚀 Getting Started:</h3>
            <ul style="color: #666;">
              <li>Complete your profile setup</li>
              <li>Explore our main features</li>
              <li>Join our community</li>
              <li>Check out our help docs</li>
            </ul>
          </div>
          
          <p style="color: #666;">
            If you have questions, reach out to our support team!
          </p>
          
          <p style="color: #333; margin-top: 30px;">
            Best regards,<br>
            <strong>The Team</strong>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, htmlContent);
  }

  // Helper method to strip HTML for text version
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

// Export singleton instance
module.exports = new EmailService();