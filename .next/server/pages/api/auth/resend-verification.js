"use strict";(()=>{var e={};e.id=4488,e.ids=[4488],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6249:(e,r)=>{Object.defineProperty(r,"l",{enumerable:!0,get:function(){return function e(r,t){return t in r?r[t]:"then"in r&&"function"==typeof r.then?r.then(r=>e(r,t)):"function"==typeof r&&"default"===t?r:void 0}}})},9906:(e,r,t)=>{t.r(r),t.d(r,{config:()=>g,default:()=>c,routeModule:()=>h});var o={};t.r(o),t.d(o,{default:()=>p});var a=t(1802),i=t(7153),n=t(6249);let s=require("nodemailer");var l=t.n(s);class d{constructor(){this.transporter=l().createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}})}async sendEmail(e){try{let r={from:`"ProvenValue" <${process.env.SMTP_FROM}>`,to:e.to,subject:e.subject,html:e.html,text:e.text},t=await this.transporter.sendMail(r);console.log("Email sent successfully:",t.messageId)}catch(e){throw console.error("Error sending email:",e),Error("Failed to send email")}}async sendVerificationEmail(e,r){let t=`${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${r}`,o=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - ProvenValue</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .highlight { color: #667eea; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to ProvenValue!</h1>
            <p>Your journey to financial freedom starts here</p>
          </div>

          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi there!</p>
            <p>Thank you for registering with <span class="highlight">ProvenValue</span>. To complete your registration and start building wealth through our automated savings platform, please verify your email address.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${t}" class="button">Verify My Email</a>
            </div>

            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e8f4fd; padding: 10px; border-radius: 5px; font-family: monospace;">${t}</p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
            </div>

            <h3>What happens next?</h3>
            <ul>
              <li>✅ Verify your email to activate your account</li>
              <li>💰 Start your automated daily savings journey</li>
              <li>📈 Track your wealth building progress</li>
              <li>🎁 Earn bonuses through our referral program</li>
            </ul>

            <p>If you didn&apos;t create an account with ProvenValue, please ignore this email.</p>

            <div class="footer">
              <p>Best regards,<br>The ProvenValue Team</p>
              <p>📧 support@provenvalue.com | 📱 +234 816 135 7294</p>
              <p style="margin-top: 20px; font-size: 11px;">
                No 1 Ibeh Road, Okota, Lagos, Nigeria<br>
                \xa9 2025 ProvenValue. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,a=`
      Welcome to ProvenValue!

      Verify Your Email Address

      Hi there!

      Thank you for registering with ProvenValue. To complete your registration, please verify your email address by clicking this link:

      ${t}

      This verification link will expire in 24 hours.

      If you didn&apos;t create an account with ProvenValue, please ignore this email.

      Best regards,
      The ProvenValue Team
      support@provenvalue.com
      +234 816 135 7294
    `;await this.sendEmail({to:e,subject:"Verify Your Email - ProvenValue",html:o,text:a})}async sendWelcomeEmail(e,r){let t=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ProvenValue!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .highlight { color: #667eea; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome aboard, ${r}!</h1>
            <p>Your wealth building journey begins now</p>
          </div>

          <div class="content">
            <h2>You&apos;re All Set!</h2>
            <p>Congratulations! Your email has been verified and your ProvenValue account is now active.</p>

            <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0;">🚀 Ready to Start Saving?</h3>
              <p>Here are your next steps:</p>
              <ol>
                <li><strong>Complete your profile</strong> - Add your banking details</li>
                <li><strong>Choose your savings plan</strong> - Daily, weekly, or monthly</li>
                <li><strong>Invite friends</strong> - Earn ₦5,000 for each referral</li>
                <li><strong>Watch your money grow</strong> - Automated savings in action</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>

            <h3>Why Choose ProvenValue?</h3>
            <ul>
              <li>🔒 <strong>Bank-level security</strong> for your savings</li>
              <li>⚡ <strong>Automated savings</strong> - no manual transfers needed</li>
              <li>📈 <strong>Competitive returns</strong> on your investments</li>
              <li>🎁 <strong>Referral bonuses</strong> up to ₦50,000</li>
              <li>📱 <strong>Mobile app</strong> for easy management</li>
            </ul>

            <div class="footer">
              <p>Happy saving!<br>The ProvenValue Team</p>
              <p>📧 support@provenvalue.com | 📱 +234 816 135 7294</p>
              <p style="margin-top: 20px; font-size: 11px;">
                No 1 Ibeh Road, Okota, Lagos, Nigeria<br>
                \xa9 2025 ProvenValue. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;await this.sendEmail({to:e,subject:"Welcome to ProvenValue! \uD83C\uDF89",html:t})}}let u=new d;async function p(e,r){if("POST"!==e.method)return r.status(405).json({message:"Method not allowed"});let{email:t}=e.body;if(!t)return r.status(400).json({message:"Email is required"});try{let e=Math.random().toString(36).substring(2)+Date.now().toString(36);await u.sendVerificationEmail(t,e),console.log("Verification email resent to:",t),r.status(200).json({message:"Verification email sent successfully! Check your inbox."})}catch(e){console.error("Error resending verification email:",e),r.status(500).json({message:"Failed to resend verification email. Please try again later.",error:e instanceof Error?e.message:"Unknown error"})}}let c=(0,n.l)(o,"default"),g=(0,n.l)(o,"config"),h=new a.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/auth/resend-verification",pathname:"/api/auth/resend-verification",bundlePath:"",filename:""},userland:o})},7153:(e,r)=>{var t;Object.defineProperty(r,"x",{enumerable:!0,get:function(){return t}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(t||(t={}))},1802:(e,r,t)=>{e.exports=t(145)}};var r=require("../../../webpack-api-runtime.js");r.C(e);var t=r(r.s=9906);module.exports=t})();