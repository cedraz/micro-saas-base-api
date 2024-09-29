import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { ValidateVerificationRequestDto } from './dto/validate-verification-request.dto';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Controller('verification-request')
@ApiTags('verification-request')
export class VerificationRequestController {
  constructor(
    private readonly verificationRequestService: VerificationRequestService,
  ) {}

  @ApiOperation({
    summary: 'Create a verification request',
  })
  @Post('create-verification-request')
  createVerificationRequest(
    @Body() createVerificationRequestDto: CreateVerificationRequestDto,
  ) {
    if (createVerificationRequestDto.type === 'EMAIL_VERIFICATION') {
      throw new ConflictException(ErrorMessagesHelper.CONFLICT);
    }

    return this.verificationRequestService.createVerificationRequest({
      createVerificationRequestDto,
    });
  }

  @ApiOperation({
    summary: 'Validate a verification request',
  })
  @Post('validate-verification-request')
  validateVerificationRequest(
    @Body() validateVerificationRequestDto: ValidateVerificationRequestDto,
  ) {
    return this.verificationRequestService.validateVerificationRequest(
      validateVerificationRequestDto,
    );
  }

  @ApiOperation({
    summary: 'Verify an email (only for admin email verification)',
  })
  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.verificationRequestService.verifyEmail(verifyEmailDto);
  }
}
