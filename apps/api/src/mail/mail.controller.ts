import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  async testEmail() {
    // Generate a dummy code
    const dummyCode = this.mailService.generateVoterCode();

    // Trigger the service!
    await this.mailService.dispatchVoterCode('kpmbmppvs@gmail.com', dummyCode);

    return {
      success: true,
      message: 'Test email triggered! Check the terminal logs and your inbox.',
    };
  }
}
