import { createTransport } from "nodemailer";

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: { server: any; from: string };
}) {
  const { server, from } = provider;

  // Create transporter
  const transporter = createTransport(server);

  const result = await transporter.sendMail({
    to: email,
    from,
    subject: "Sign in to Ìpínayò",
    text: text({ url, email }),
    html: html({ url, email }),
  });

  const failed = result.rejected;
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

function html({ url, email }: { url: string; email: string }) {
  const escapedEmail = `${email.replace(/\./g, "&#8203;.")}`;
  const escapedHost = `${new URL(url).host.replace(/\./g, "&#8203;.")}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Ìpínayò</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo img {
      height: 48px;
      width: auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #8B5A3C;
      font-size: 28px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }
    .header p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }
    .content {
      margin-bottom: 30px;
    }
    .content p {
      margin-bottom: 20px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #8B5A3C 0%, #A0522D 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      transition: transform 0.2s ease;
    }
    .button:hover {
      transform: translateY(-1px);
    }
    .fallback {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    .fallback a {
      color: #8B5A3C;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div style="width: 200px; height: 48px; background: #8B5A3C; color: white; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 18px;">
        ipinayo
      </div>
    </div>
    
    <div class="header">
      <h1>Welcome to ipinayo</h1>
      <p>Your Catholic Mass Selections Platform</p>
    </div>
    
    <div class="content">
      <p>Hi <strong>${escapedEmail}</strong>,</p>
      <p>Click the button below to sign in to your ipinayo Mass Selections account. This link will expire in 24 hours for your security.</p>
      
      <div style="text-align: center;">
        <a href="${url}" class="button">Sign in to ipinayo</a>
      </div>
      
      <p>Once signed in, you'll be able to create, manage, and share your Mass selections with ease.</p>
    </div>
    
    <div class="fallback">
      <p><strong>Having trouble with the button?</strong></p>
      <p>Copy and paste this link into your browser:</p>
      <p><a href="${url}">${url}</a></p>
    </div>
    
    <div class="footer">
      <p>This email was sent to ${escapedEmail} from ${escapedHost}</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;
}

function text({ url, email }: { url: string; email: string }) {
  return `
Sign in to Ìpínayò

Hi ${email},

Click the link below to sign in to your Ìpínayò account:

${url}

This link will expire in 24 hours for your security.

If you didn't request this email, you can safely ignore it.

Best regards,
Ìpínayò
`;
}
