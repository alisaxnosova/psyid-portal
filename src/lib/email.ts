import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationCode(to: string, code: string): Promise<void> {
  const { error } = await resend.emails.send({
    from: 'PsyID <support@psyid.me>',
    to,
    subject: `Your PsyID verification code: ${code}`,
    text: [
      `Your PsyID verification code is: ${code}`,
      '',
      'This code expires in 10 minutes.',
      '',
      "If you didn't request this, you can safely ignore this email.",
      '',
      '— PsyID',
    ].join('\n'),
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#FBF7F1;border-radius:20px;padding:44px 40px;border:1px solid #E5DED2;">
        <tr><td>
          <div style="font-weight:800;font-size:18px;letter-spacing:-0.03em;color:#0E1230;margin-bottom:28px;">
            PsyID
          </div>

          <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.025em;color:#0E1230;margin:0 0 10px;">
            Verify your email
          </h1>
          <p style="color:#4F5470;font-size:15px;line-height:1.55;margin:0 0 28px;">
            Enter this code on the registration page to complete your account setup.
          </p>

          <div style="text-align:center;padding:28px 24px;background:#fff;border-radius:16px;border:1px solid #E5DED2;margin-bottom:28px;">
            <div style="font-size:48px;font-weight:800;letter-spacing:0.18em;color:#2244E0;font-family:'Courier New',monospace;">
              ${code}
            </div>
            <div style="margin-top:10px;font-size:13px;color:#8A8FA8;font-family:'Courier New',monospace;letter-spacing:0.05em;">
              EXPIRES IN 10 MINUTES
            </div>
          </div>

          <p style="color:#8A8FA8;font-size:13px;line-height:1.55;margin:0;">
            If you didn&rsquo;t create a PsyID account, you can safely ignore this email.
            No account will be created without verifying this code.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  });

  if (error) throw new Error(error.message);
}
