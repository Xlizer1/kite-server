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

  // Test SendGrid connection
  async testConnection() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    try {
      console.log('🔍 Testing SendGrid connection...');
      console.log('✅ SendGrid connection test passed!');
      return true;
    } catch (error) {
      console.error('❌ SendGrid connection failed:', error.message);
      throw error;
    }
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
      console.log(`📝 Subject: ${subject}`);
      
      const response = await sgMail.send(msg);
      
      console.log('✅ Email sent successfully!');
      console.log(`📧 Message ID: ${response[0].headers['x-message-id']}`);
      
      return { 
        success: true, 
        messageId: response[0].headers['x-message-id'],
        response: response[0].statusCode 
      };
      
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      
      // Handle specific SendGrid errors
      if (error.code === 401) {
        throw new Error('SendGrid authentication failed. Check your API key.');
      } else if (error.code === 403) {
        throw new Error('SendGrid access forbidden. Verify your sender email.');
      } else if (error.responseBody) {
        throw new Error(`SendGrid error: ${error.responseBody.errors?.[0]?.message || error.message}`);
      } else {
        throw new Error(`Email sending failed: ${error.message}`);
      }
    }
  }

  // ✅ This is the function your controller calls
  async sendPasswordResetEmail(userEmail, resetLink) {
    const subject = 'Reset Your Password';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0; text-align: center;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      You requested to reset your password. Click the button below to create a new password:
                    </p>
                    
                    <!-- Reset Button -->
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="${resetLink}" 
                         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 16px 32px;
                                text-decoration: none;
                                border-radius: 25px;
                                display: inline-block;
                                font-weight: bold;
                                font-size: 16px;
                                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                        Reset My Password
                      </a>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin: 30px 0;">
                      <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>⚠️ Security Notice:</strong><br>
                        • This link will expire in 1 hour<br>
                        • If you didn't request this reset, please ignore this email<br>
                        • Never share this link with anyone
                      </p>
                    </div>
                    
                    <!-- Alternative Link -->
                    <p style="color: #666; font-size: 14px; margin: 30px 0 0 0;">
                      If the button doesn't work, copy and paste this link into your browser:<br>
                      <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      This email was sent from Kite System.<br>
                      Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const textContent = `
      Password Reset Request
      
      You requested to reset your password. Use this link to reset it:
      ${resetLink}
      
      This link will expire in 1 hour.
      If you didn't request this, please ignore this email.
      
      This email was sent from Kite System.
    `;

    return await this.sendEmail(userEmail, subject, htmlContent, textContent);
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName) {
    const subject = `Welcome to Kite System, ${userName}! 🎉`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome ${userName}! 🎉</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 18px; margin-top: 0;">
            Thank you for joining Kite System!
          </p>
          
          <p style="color: #666; font-size: 16px;">
            You now have access to our restaurant management platform. Here's what you can do:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🚀 Getting Started:</h3>
            <ul style="color: #666;">
              <li>Manage your restaurant orders</li>
              <li>Track inventory and supplies</li>
              <li>Monitor table statuses</li>
              <li>View analytics and reports</li>
            </ul>
          </div>
          
          <p style="color: #666;">
            If you have any questions, contact your system administrator.
          </p>
          
          <p style="color: #333; margin-top: 30px;">
            Best regards,<br>
            <strong>The Kite Team</strong>
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

module.exports = new EmailService();