import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    this.transporter
      .verify()
      .then(() => console.log('[MAIL] SMTP connection verified successfully'))
      .catch((err) =>
        console.error('[MAIL] SMTP verification failed:', err),
      );
  }

  generateVoterCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private generateBrandedEmail(securityCode: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#4c0519;padding:28px 32px;text-align:center;border-radius:6px 6px 0 0;">
              <h1 style="color:#ffffff;font-size:13px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0;">
                OFFICIAL SRC ELECTION COMMITTEE
              </h1>
            </td>
          </tr>

          <!-- BODY CARD -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <p style="color:#334155;font-size:16px;margin:0 0 8px 0;">Dear Voter,</p>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 28px 0;">
                You have been registered as a voter for the upcoming election. Below is your secure voting code.
                Please keep it confidential.
              </p>

              <!-- CODE BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:3px solid #4c0519;border-radius:8px;margin:0 0 28px 0;">
                <tr>
                  <td style="padding:32px 24px;text-align:center;">
                    <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px 0;">
                      Secure Voting Code
                    </p>
                    <h1 style="color:#c5a021;font-size:56px;font-weight:900;letter-spacing:14px;margin:0;font-family:'Courier New',monospace;">
                      ${securityCode}
                    </h1>
                  </td>
                </tr>
              </table>

              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">
                Enter this code when prompted during the voting process. If you did not expect this email,
                please contact the Election Committee immediately.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f1f5f9;padding:20px 32px;text-align:center;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 0 6px 6px;">
              <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.5;">
                This is an automated system. Please do not share this code with anyone.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async dispatchVoterCode(
    toEmail: string,
    securityCode: string,
  ): Promise<void> {
    try {
      const html = this.generateBrandedEmail(securityCode);

      await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'election@src.edu.my',
        to: toEmail,
        subject: 'Your Official SRC Election Voting Code',
        html,
      });

      this.logger.log(`Security code email sent to ${toEmail}`);
    } catch (error) {
      console.error('[MAIL ERROR] Failed to send to', toEmail, error);
      throw error;
    }
  }
}
