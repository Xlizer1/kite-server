// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Password Reset Request - Kite Restaurant System',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #213555; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 24px; 
                        background-color: #213555; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Kite Restaurant System</h1>
                        <h2>Password Reset Request</h2>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'User'},</p>
                        <p>You requested a password reset for your Kite Restaurant System account.</p>
                        <p>Click the button below to reset your password:</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </p>
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>For security, never share this link with anyone</li>
                        </ul>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from Kite Restaurant System. Please do not reply.</p>
                        <p>If you need help, contact your system administrator.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

const sendWelcomeEmail = async (email, userName, tempPassword) => {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Welcome to Kite Restaurant System',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Kite Restaurant System</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #213555; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #213555; margin: 20px 0; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 24px; 
                        background-color: #213555; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Kite Restaurant System</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName},</p>
                        <p>Your account has been created successfully! You can now access the Kite Restaurant System.</p>
                        
                        <div class="credentials">
                            <h3>Your Login Credentials:</h3>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${loginUrl}" class="button">Login Now</a>
                        </p>
                        
                        <p><strong>Important Security Notes:</strong></p>
                        <ul>
                            <li>Please change your password after your first login</li>
                            <li>Keep your login credentials secure</li>
                            <li>Never share your password with anyone</li>
                        </ul>
                        
                        <p>If you have any questions or need assistance, please contact your system administrator.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from Kite Restaurant System. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw new Error('Failed to send welcome email');
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail
};
