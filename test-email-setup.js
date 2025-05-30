// diagnostic-email-test.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function diagnoseSendGridIssues() {
    console.log('🔍 Diagnosing SendGrid Delivery Issues...\n');

    // Step 1: Verify configuration
    console.log('📋 1. Configuration Check:');
    console.log(`   API Key: ${process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 15) + '...' : 'MISSING'}`);
    console.log(`   From Email: ${process.env.FROM_EMAIL || 'MISSING'}`);
    
    if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
        console.error('❌ Missing required environment variables');
        return;
    }

    // Step 2: Test with minimal email (most likely to succeed)
    console.log('\n📧 2. Testing with minimal email...');
    
    const testEmail = 'almlm291@gmail.com'; // 👈 CHANGE THIS TO YOUR PERSONAL EMAIL
    
    if (testEmail === 'your-personal-email@gmail.com') {
        console.error('❌ Please update testEmail variable with your actual personal email address');
        return;
    }

    const minimalMsg = {
        to: testEmail,
        from: process.env.FROM_EMAIL,
        subject: 'SendGrid Test - Minimal',
        text: 'This is a minimal test email. If you receive this, basic delivery is working.',
        html: '<p>This is a minimal test email. If you receive this, basic delivery is working.</p>'
    };

    try {
        console.log(`📤 Sending minimal test email to: ${testEmail}`);
        const response = await sgMail.send(minimalMsg);
        
        console.log('✅ Email sent to SendGrid successfully!');
        console.log(`📊 Response Code: ${response[0].statusCode}`);
        console.log(`🆔 Message ID: ${response[0].headers['x-message-id']}`);
        
        // Check if there were any warnings
        if (response[0].statusCode !== 202) {
            console.warn(`⚠️  Unexpected status code: ${response[0].statusCode}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        
        if (error.response && error.response.body) {
            console.error('📋 SendGrid Error Details:', JSON.stringify(error.response.body, null, 2));
        }
        
        return;
    }

    // Step 3: Check for common issues
    console.log('\n🔍 3. Common Issue Checklist:');
    
    // Check FROM_EMAIL format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.FROM_EMAIL)) {
        console.error('❌ FROM_EMAIL format appears invalid');
    } else {
        console.log('✅ FROM_EMAIL format looks valid');
    }
    
    // Check if using free email provider (often causes issues)
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const fromDomain = process.env.FROM_EMAIL.split('@')[1];
    if (freeProviders.includes(fromDomain)) {
        console.warn(`⚠️  Using free email provider (${fromDomain}) as sender may cause delivery issues`);
        console.log('   💡 Consider using a domain email or verifying with SendGrid');
    } else {
        console.log(`✅ Using domain email: ${fromDomain}`);
    }

    // Step 4: Provide next steps
    console.log('\n📝 4. Next Steps:');
    console.log('1. 📧 Check your email inbox (including spam folder)');
    console.log('2. 🔍 Check SendGrid Activity Feed: https://app.sendgrid.com/email_activity');
    console.log('3. ✉️  Verify your sender email: https://app.sendgrid.com/settings/sender_auth');
    console.log('4. ⏰ Wait 5-10 minutes - sometimes there\'s a delay');
    
    console.log('\n🚨 If email still not received:');
    console.log('1. Go to SendGrid → Settings → Sender Authentication');
    console.log('2. Add and verify your FROM_EMAIL address');
    console.log('3. Consider domain authentication for better delivery rates');
    
    console.log('\n⭐ Pro Tips:');
    console.log('• New SendGrid accounts often have delivery restrictions');
    console.log('• Free email addresses (gmail, yahoo) as senders have lower delivery rates');
    console.log('• Check your SendGrid account limits and restrictions');
}

// Also test with different email content
async function testDifferentEmailTypes() {
    console.log('\n🧪 Testing Different Email Types...\n');
    
    const testEmail = 'almlm291@gmail.com'; // 👈 CHANGE THIS
    
    if (testEmail === 'your-personal-email@gmail.com') {
        console.log('⚠️  Update testEmail variable to test different email types');
        return;
    }

    const emailTests = [
        {
            name: 'Plain Text Only',
            msg: {
                to: testEmail,
                from: process.env.FROM_EMAIL,
                subject: 'Test 1: Plain Text',
                text: 'This is a plain text only email.'
            }
        },
        {
            name: 'Simple HTML',
            msg: {
                to: testEmail,
                from: process.env.FROM_EMAIL,
                subject: 'Test 2: Simple HTML',
                html: '<h1>Simple HTML Email</h1><p>This email contains basic HTML.</p>'
            }
        },
        {
            name: 'Both Text and HTML',
            msg: {
                to: testEmail,
                from: process.env.FROM_EMAIL,
                subject: 'Test 3: Text + HTML',
                text: 'This is the text version.',
                html: '<h1>HTML Version</h1><p>This is the HTML version.</p>'
            }
        }
    ];

    for (let i = 0; i < emailTests.length; i++) {
        const test = emailTests[i];
        console.log(`📧 ${i + 1}. Testing: ${test.name}`);
        
        try {
            const response = await sgMail.send(test.msg);
            console.log(`   ✅ Sent successfully (${response[0].statusCode})`);
            
            // Add delay between sends
            if (i < emailTests.length - 1) {
                console.log('   ⏳ Waiting 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        }
    }
}

// Run diagnostics
async function runFullDiagnostic() {
    await diagnoseSendGridIssues();
    await testDifferentEmailTypes();
    
    console.log('\n📊 Final Recommendations:');
    console.log('1. Check SendGrid Activity Feed for delivery status');
    console.log('2. Verify your sender email address');
    console.log('3. Consider upgrading SendGrid plan if on free tier');
    console.log('4. Set up domain authentication for better deliverability');
}

runFullDiagnostic().catch(console.error);