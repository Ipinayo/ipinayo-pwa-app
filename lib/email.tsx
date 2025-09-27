import type { NodemailerConfig } from "next-auth/providers/nodemailer";
import { createTransport } from "nodemailer";

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  expires: Date;
  provider: NodemailerConfig;
  token: string;
  theme: any;
  request: Request;
}) {
  // your email sending logic, update to use new params if needed
  const { server, from } = provider;

  // Create transporter
  const transporter = createTransport(server);

  const result = await transporter.sendMail({
    to: email,
    from,
    subject: "Sign in to Ìpínayò",
    text: text({ url, email }),
    html: html({ url, email, from }),
  });

  const failed = result.rejected;
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

function html({
  url,
  email,
  from,
}: {
  url: string;
  email: string;
  from?: string;
}) {
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
      color: #030f2b;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px #030f2b;
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
      color: #175bea;
      font-size: 32px;
      margin: 0 0 1px 0;
      font-weight: 600;
      background: linear-gradient(to bottom, #175bea , #00c5fb); 
      -webkit-background-clip: text; 
      background-clip: text;
      color: transparent; 
    }
    .header p {
      background: linear-gradient(to bottom, #175bea , #00c5fb); 
      -webkit-background-clip: text; 
      background-clip: text;
      color: transparent;
      font-size: 12px;
      text-transform: uppercase;
      font-style: italic;
      letter-spacing: -0.5px;
      word-spacing: -1px;
      margin: 0;
    }
    .content {
      margin-bottom: 30px;
    }
    .content p {
      margin: 1px;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #00c5fb 0%, #175bea 100%);
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
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #63738a;
    }
    .fallback a {
      color: #175bea;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #63738a;
    }
    .footer p {
      margin: 1px;
      font-size: 12px;
    }  
  </style>
</head>
<body>
  <div class="container">
    
    <div class="header">
      <h1>Ìpínayò</h1>
      <p>SHARING JOY THROUGH MUSIC</p>
    </div>
    
    <div class="content">
      <p style="margin-bottom: 20px;">Hi <strong>${escapedEmail}</strong>,</p>
      <div style="margin-bottom: 20px;">
        <p>Click the button below to sign in to your Ìpínayò account.</p> 
        <p>This link will expire in 24 hours.</p>
      </div>

      <div style="text-align: center;">
        <a href="${url}" class="button">Sign in to Ìpínayò</a>
      </div>
    </div>
    
    <div class="fallback">
      <p><strong>Having trouble with the button?</strong></p>
      <p>Copy and paste this link into your browser:</p>
      <p><a href="${url}">${url}</a></p>
    </div>
    
    <div class="footer">
      <p>This email was sent to ${escapedEmail} from ${from || escapedHost}</p>
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

This link will expire in 24 hours.

If you didn't request this email, you can safely ignore it.

Best regards,
Ìpínayò
`;
}
