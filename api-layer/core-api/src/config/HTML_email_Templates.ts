/**
 * Returns an HTML template for a password reset email.
 * @param {string} email The email address of the user.
 * @param {string} link The link to reset the password.
 * @return {string} The HTML template for the email.
 */
function getResetEmailTemplate(email: string, link: string) {
    return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        padding: 40px 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .header {
        background-color: #333;
        padding: 20px;
        text-align: center;
      }
      .header img {
        max-height: 40px;
      }
      h2 {
        color: #333;
      }
      .content {
        font-size: 16px;
        color: #333;
        line-height: 1.6;
      }
      a {
        color: #2a6fdb;
        text-decoration: none;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #aaa;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://via.placeholder.com/100x40?text=Logo" alt="Logo" />
      </div>
      <h2>You have requested a password change</h2>
      <div class="content">
        <p>
          We received a request to reset the password for your account. To proceed, please click the link below to create a new password:
        </p>
        <p>
          <a href="${link}">${link}</a>
        </p>
        <p>This link will expire in one hour.</p>
        <p>
          If you didn't request this password reset, please ignore this email or let us know immediately. Your account remains secure.
        </p>
        <p>Best regards,<br />Titanium Ignis Team</p>
      </div>
      <div class="footer">
        The email was sent to ${email}.<br />
        You received this email because you are registered with Titanium Ignis
      </div>
    </div>
  </body>
</html>`;
}

/**
 * Returns an HTML template for a password reset email.
 * @param {string} email The email address of the user.
 * @param {string} link The link to reset the password.
 * @return {string} The HTML template for the email.
 */
function getPasswordResetEmailTemplate(email: string, link: string) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header img {
      max-height: 50px;
    }
    h2 {
      color: #222;
      text-align: center;
    }
    .content {
      color: #555;
      font-size: 16px;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background-color: #2a6fdb;
      color: #ffffff;
      padding: 12px 20px;
      margin: 20px 0;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
    }
    .link {
      word-break: break-all;
      font-size: 14px;
      color: #2a6fdb;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://via.placeholder.com/120x40?text=Logo" alt="Titanium Ignis Logo" />
    </div>
    <h2>Password Reset Request</h2>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset the password for your account. To continue, please click the button below:</p>
      <p style="text-align: center;">
        <a class="btn" href="${link}" target="_blank" rel="noopener noreferrer">Reset Your Password</a>
      </p>
      <p>If the button above doesn't work, you can also use this link:</p>
      <p class="link">${link}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Thank you,<br />The Titanium Ignis Team</p>
    </div>
    <div class="footer">
      This message was sent to ${email}.<br />
      You are receiving this email because you have an account with Titanium Ignis.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Returns an HTML template for a team invitation email.
 * @param {string} invitedEmail The email address of the invited user.
 * @param {string} inviterName The name of the person who sent the invitation.
 * @param {string} teamName The name of the team they're being invited to.
 * @param {string} companyName The name of the company.
 * @param {string} inviteLink The link to accept the invitation.
 * @return {string} The HTML template for the email.
 */
function getTeamInvitationEmailTemplate(invitedEmail: string, inviterName: string, teamName: string, companyName: string, inviteLink: string) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0a0a0a;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background-color: #1a1a1a;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    .header {
      background-color: #0a0a0a;
      padding: 32px 40px;
      text-align: center;
      border-bottom: 1px solid #2a2a2a;
    }
    .logo {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
      color: #e0e0e0;
      font-size: 16px;
      line-height: 1.6;
    }
    h2 {
      color: #ffffff;
      font-size: 24px;
      margin: 0 0 24px 0;
      font-weight: 600;
    }
    .invite-details {
      background-color: #0a0a0a;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .invite-details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #2a2a2a;
    }
    .invite-details-row:last-child {
      border-bottom: none;
    }
    .invite-label {
      color: #888;
      font-size: 14px;
    }
    .invite-value {
      color: #fff;
      font-weight: 500;
    }
    .btn {
      display: inline-block;
      background-color: #ff6b35;
      color: #ffffff;
      padding: 14px 32px;
      margin: 24px 0;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #ff8555;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .link-fallback {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #2a2a2a;
    }
    .link {
      word-break: break-all;
      font-size: 13px;
      color: #ff6b35;
      text-decoration: none;
    }
    .footer {
      background-color: #0a0a0a;
      padding: 24px 40px;
      font-size: 13px;
      color: #666;
      text-align: center;
      border-top: 1px solid #2a2a2a;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-links a {
      color: #888;
      text-decoration: none;
      margin: 0 12px;
    }
    .footer-links a:hover {
      color: #ff6b35;
    }
    .highlight {
      color: #ff6b35;
      font-weight: 500;
    }
    .expiry-notice {
      background-color: #2a1a15;
      border-left: 3px solid #ff6b35;
      padding: 12px 16px;
      margin: 24px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #ffb399;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Obtura</div>
    </div>
    
    <div class="content">
      <h2>You've been invited to join a team</h2>
      
      <p>Hi there,</p>
      
      <p><span class="highlight">${inviterName}</span> has invited you to join their team on Obtura, the DevOps automation platform that helps development teams ship code without a DevOps team.</p>
      
      <div class="invite-details">
        <div class="invite-details-row">
          <span class="invite-label">Team </span>
          <span class="invite-value"> ${teamName}</span>
        </div>
        <div class="invite-details-row">
          <span class="invite-label">Company </span>
          <span class="invite-value"> ${companyName}</span>
        </div>
        <div class="invite-details-row">
          <span class="invite-label">Invited by </span>
          <span class="invite-value"> ${inviterName}</span>
        </div>
      </div>
      
      <div class="btn-container">
        <a class="btn" href="${inviteLink}" target="_blank" rel="noopener noreferrer">Accept Invitation</a>
      </div>
      
      <div class="expiry-notice">
        ⏱ This invitation will expire in 7 days
      </div>
      
      <p>Once you join, you'll be able to:</p>
      <ul style="color: #b0b0b0; line-height: 1.8;">
        <li>Deploy projects with zero-config infrastructure</li>
        <li>Access built-in monitoring and logging</li>
        <li>Collaborate with your team on deployments</li>
        <li>Ship code faster without DevOps complexity</li>
      </ul>
      
      <div class="link-fallback">
        <p style="color: #888; font-size: 14px; margin-bottom: 8px;">If the button doesn't work, copy and paste this link:</p>
        <a class="link" href="${inviteLink}" target="_blank" rel="noopener noreferrer">${inviteLink}</a>
      </div>
      
      <p style="margin-top: 32px; color: #888; font-size: 14px;">
        If you didn't expect this invitation or don't know ${inviterName}, you can safely ignore this email.
      </p>
    </div>
    
    <div class="footer">
      This invitation was sent to ${invitedEmail}
      <div class="footer-links">
        <a href="https://obtura.io" target="_blank">Website</a>
        <a href="https://docs.obtura.io" target="_blank">Documentation</a>
        <a href="mailto:support@obtura.io">Support</a>
      </div>
      <p style="margin-top: 16px;">© 2025 Obtura. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export { getResetEmailTemplate, getPasswordResetEmailTemplate, getTeamInvitationEmailTemplate };
