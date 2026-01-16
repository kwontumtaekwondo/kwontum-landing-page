// lib/email-service.js
import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
})

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error)
  } else {
    console.log('✅ SMTP Server is ready to send messages')
    console.log(`📧 Using: ${process.env.SMTP_USER}`)
  }
})

// Email templates - Simple and clean Kwontum Taekwondo style
const emailTemplates = {
  passwordReset: (otpCode, userName) => ({
    subject: 'Password Reset Code - Kwontum Taekwondo',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-wrapper {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border: 1px solid #eaeaea;
        }
        .header {
            background: linear-gradient(135deg, #7a1c1c 0%, #9d2a2a 100%);
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 0;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
            margin: 5px 0 0 0;
            font-weight: normal;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 25px;
        }
        .otp-box {
            background: #f8f9fa;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
        }
        .otp-code {
            font-family: 'Courier New', monospace;
            font-size: 40px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #7a1c1c;
            margin: 10px 0;
        }
        .expiry-note {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px 15px;
            border-radius: 6px;
            margin: 25px 0;
            font-size: 14px;
        }
        .note {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            margin: 20px 0;
        }
        .footer {
            padding: 20px;
            text-align: center;
            background: #f8f9fa;
            border-top: 1px solid #eaeaea;
            color: #666;
            font-size: 12px;
        }
        .footer-logo {
            color: #7a1c1c;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        @media only screen and (max-width: 500px) {
            .content {
                padding: 20px;
            }
            .otp-code {
                font-size: 32px;
                letter-spacing: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="logo-text">KWONTUM TAEKWONDO</div>
            <div class="tagline">DRIVEN BY FUNDAMENTALS, DEFINED BY EXCELLENCE</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hi <strong>${userName}</strong>,
            </div>
            
            <p>Here's your password reset verification code:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otpCode}</div>
            </div>
            
            <div class="expiry-note">
                ⏰ This code will expire in <strong>5 minutes</strong>
            </div>
            
            <div class="note">
                If you didn't request this password reset, you can safely ignore this email. 
                Your account security is important to us.
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-logo">Kwontum Taekwondo</div>
            <div>This is an automated message. Please do not reply.</div>
            <div style="margin-top: 8px; font-size: 11px; color: #888;">
                © ${new Date().getFullYear()} Kwontum Taekwondo. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
    `,
    text: `
KWONTUM TAEKWONDO
Excel with Discipline & Honor

Hi ${userName},

Here's your password reset verification code:

${otpCode}

This code will expire in 5 minutes.

If you didn't request this password reset, you can safely ignore this email.

This is an automated message from Kwontum Taekwondo.
Please do not reply to this email.

© ${new Date().getFullYear()} Kwontum Taekwondo. All rights reserved.
    `
  })
}

// Main email sending function
export async function sendPasswordResetEmail(email, otpCode, userName) {
  try {
    const template = emailTemplates.passwordReset(otpCode, userName)
    
    const mailOptions = {
      from: `"Kwontum Taekwondo" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      // Priority headers
      headers: {
        'X-Priority': '1',
        'Importance': 'high',
        'X-Mailer': 'Kwontum Taekwondo System'
      }
    }

    console.log('📤 Sending password reset email to:', email)
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email sent successfully:', {
      to: email,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    })
    
    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    }
    
  } catch (error) {
    console.error('❌ Failed to send email:', {
      to: email,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    })
    
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }
}

// Test email function
export async function testEmailService() {
  try {
    console.log('🧪 Testing Kwontum Taekwondo email service...')
    console.log('📧 From:', process.env.EMAIL_FROM || process.env.SMTP_USER)
    
    const testResult = await sendPasswordResetEmail(
      process.env.SMTP_USER, // Send to yourself for testing
      '123456',
      'Test User'
    )
    
    if (testResult.success) {
      console.log('✅ Email service test PASSED')
      console.log('📨 Message ID:', testResult.messageId)
    } else {
      console.log('❌ Email service test FAILED:', testResult.error)
    }
    
    return testResult
  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return { success: false, error: error.message }
  }
}