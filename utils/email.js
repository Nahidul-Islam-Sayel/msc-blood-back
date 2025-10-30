const nodemailer = require('nodemailer');

class Email {
  constructor(user, url = '') {
    this.to = user.email;
    this.firstName = user.fullName.split(' ')[0];
    this.url = url;
    this.from = `Blood Donation System <${process.env.EMAIL_FROM}>`;
  }

  // Create transporter for Gmail
  newTransport() {
    // Gmail configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    try {
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: subject,
        html: template,
        text: template.replace(/<[^>]*>/g, '') // Fallback text version
      };

      console.log('Attempting to send email to:', this.to);
      console.log('Using email service:', process.env.EMAIL_HOST);
      
      const transporter = this.newTransport();
      const result = await transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully! Message ID:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Send welcome email with verification link
  async sendWelcome() {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Arial', 'Helvetica', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f9f9f9;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(to right, #dc2626, #b91c1c); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
            border: 1px solid #e5e7eb; 
          }
          .button { 
            display: inline-block; 
            padding: 14px 28px; 
            background: #dc2626; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: bold;
            font-size: 16px;
          }
          .button:hover {
            background: #b91c1c;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #6b7280; 
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .verification-code {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
            font-family: monospace;
            font-size: 18px;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">♥ রক্তদাতা নেটওয়ার্কে স্বাগতম</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">জীবন বাঁচাতে আপনার যাত্রা শুরু করুন</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">প্রিয় ${this.firstName},</h2>
            
            <p style="margin-bottom: 15px;">আপনাকে রক্তদাতা নেটওয়ার্কে স্বাগতম! আপনার অ্যাকাউন্ট তৈরি হয়েছে এবং এখন আপনি জীবন বাঁচানোর এই মহৎ কাজে অংশ নিতে প্রস্তুত।</p>
            
            <p style="margin-bottom: 20px; font-weight: bold; color: #dc2626;">আপনার ইমেইল ঠিকানা যাচাই করতে নিচের বাটনে ক্লিক করুন:</p>
            
            <div style="text-align: center;">
              <a href="${this.url}" class="button">ইমেইল যাচাই করুন</a>
            </div>

            <p style="margin: 20px 0; font-size: 14px; color: #6b7280;">
              অথবা এই লিঙ্কটি কপি করে ব্রাউজারে পেস্ট করুন:<br>
              <div class="verification-code">${this.url}</div>
            </p>

            <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">🚨 গুরুত্বপূর্ণ তথ্য:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li>এই লিঙ্কটি <strong>২৪ ঘন্টা</strong> পর্যন্ত বৈধ থাকবে</li>
                <li>ইমেইল যাচাইকরণের পরেই আপনি লগইন করতে পারবেন</li>
                <li>স্প্যাম ফোল্ডার চেক করতে ভুলবেন না</li>
              </ul>
            </div>

            <p style="margin-bottom: 10px;">ধন্যবাদান্তে,</p>
            <p style="margin: 0; font-weight: bold; color: #dc2626;">রক্তদাতা নেটওয়ার্ক টিম</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} রক্তদাতা নেটওয়ার্ক। সকল অধিকার সংরক্ষিত।</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">
              এটি একটি স্বয়ংক্রিয় ইমেইল। অনুগ্রহ করে উত্তর দিবেন না।
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.send(template, 'আপনার ইমেইল যাচাই করুন - রক্তদাতা নেটওয়ার্ক');
  }

  // Send email verification
  async sendVerification() {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Arial', 'Helvetica', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f9f9f9;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(to right, #dc2626, #b91c1c); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
            border: 1px solid #e5e7eb; 
          }
          .button { 
            display: inline-block; 
            padding: 14px 28px; 
            background: #dc2626; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: bold;
            font-size: 16px;
          }
          .button:hover {
            background: #b91c1c;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #6b7280; 
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .verification-code {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
            font-family: monospace;
            font-size: 16px;
            word-break: break-all;
            border: 1px dashed #d1d5db;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">ইমেইল যাচাইকরণ</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">আপনার অ্যাকাউন্ট সক্রিয় করুন</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">প্রিয় ${this.firstName},</h2>
            
            <p style="margin-bottom: 15px;">আপনার ইমেইল ঠিকানা যাচাই করতে নিচের বাটনে ক্লিক করুন:</p>
            
            <div style="text-align: center;">
              <a href="${this.url}" class="button">ইমেইল যাচাই করুন</a>
            </div>

            <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">📌 যদি বাটন কাজ না করে:</p>
              <p style="margin: 10px 0 0 0; color: #92400e;">
                নিচের URL টি কপি করে আপনার ব্রাউজারের অ্যাড্রেস বারে পেস্ট করুন:
              </p>
              <div class="verification-code">${this.url}</div>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin: 0 0 10px 0;">ℹ️ তথ্য:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li>এই লিঙ্কটি <strong>২৪ ঘন্টা</strong> পর্যন্ত বৈধ</li>
                <li>যাচাইকরণের পর আপনি লগইন করতে পারবেন</li>
                <li>আপনি রক্তদাতা হিসেবে তালিকাভুক্ত হবেন</li>
              </ul>
            </div>

            <p style="margin-bottom: 10px;">আপনার সহযোগিতার জন্য ধন্যবাদ,</p>
            <p style="margin: 0; font-weight: bold; color: #dc2626;">রক্তদাতা নেটওয়ার্ক</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} রক্তদাতা নেটওয়ার্ক। সকল অধিকার সংরক্ষিত।</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">
              যদি আপনি এই অ্যাকাউন্ট তৈরি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.send(template, 'আপনার ইমেইল যাচাই করুন - রক্তদাতা নেটওয়ার্ক');
  }

  // Send password reset email
  async sendPasswordReset() {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Arial', 'Helvetica', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f9f9f9;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #ffffff;
          }
          .header { 
            background: linear-gradient(to right, #dc2626, #b91c1c); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
            border: 1px solid #e5e7eb; 
          }
          .button { 
            display: inline-block; 
            padding: 14px 28px; 
            background: #dc2626; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: bold;
            font-size: 16px;
          }
          .button:hover {
            background: #b91c1c;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #6b7280; 
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .warning {
            background: #fef2f2;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">পাসওয়ার্ড রিসেট</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">আপনার অ্যাকাউন্ট সুরক্ষিত করুন</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">প্রিয় ${this.firstName},</h2>
            
            <p style="margin-bottom: 15px;">আপনার পাসওয়ার্ড রিসেট করতে নিচের বাটনে ক্লিক করুন:</p>
            
            <div style="text-align: center;">
              <a href="${this.url}" class="button">পাসওয়ার্ড রিসেট করুন</a>
            </div>

            <div class="warning">
              <p style="margin: 0; color: #dc2626; font-weight: bold;">⚠️ গুরুত্বপূর্ণ:</p>
              <p style="margin: 10px 0 0 0; color: #dc2626;">
                এই লিঙ্কটি <strong>১০ মিনিট</strong> পর্যন্ত বৈধ থাকবে। দ্রুত কাজটি সম্পন্ন করুন।
              </p>
            </div>

            <p style="margin: 20px 0; color: #6b7280; font-size: 14px;">
              যদি আপনি পাসওয়ার্ড রিসেটের অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন। 
              আপনার অ্যাকাউন্ট নিরাপদ থাকবে।
            </p>

            <p style="margin-bottom: 10px;">সশ্রদ্ধান্তে,</p>
            <p style="margin: 0; font-weight: bold; color: #dc2626;">রক্তদাতা নেটওয়ার্ক সুরক্ষা টিম</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} রক্তদাতা নেটওয়ার্ক। সকল অধিকার সংরক্ষিত।</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">
              এটি একটি স্বয়ংক্রিয় সুরক্ষা ইমেইল। অনুগ্রহ করে উত্তর দিবেন না।
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.send(template, 'আপনার পাসওয়ার্ড রিসেট করুন - রক্তদাতা নেটওয়ার্ক');
  }
}

module.exports = Email;