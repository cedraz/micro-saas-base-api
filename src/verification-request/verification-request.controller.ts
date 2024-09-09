import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { MasterAuthGuard } from 'src/auth/guards/master-auth.guard';
import { ValidateVerificationRequestDto } from './dto/validate-verification-request.dto';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Controller('verification-request')
@ApiTags('verification-request')
export class VerificationRequestController {
  constructor(
    private readonly verificationRequestService: VerificationRequestService,
  ) {}

  @ApiOperation({
    summary:
      'Send verification request to create a common admin (only for master admins)',
  })
  @ApiBearerAuth()
  @Post('create-admin-verification-request')
  @UseGuards(MasterAuthGuard)
  createAdminVerificationRequest(@Body() email: string) {
    return this.verificationRequestService.createAdminVerificationRequest(
      email,
    );
  }

  @ApiOperation({
    summary: 'Create a verification request (not for admin creation)',
  })
  @Post('create-verification-request')
  createVerificationRequest(
    @Body() createVerificationRequestDto: CreateVerificationRequestDto,
  ) {
    if (createVerificationRequestDto.type === 'CREATE_ADMIN_ACCOUNT') {
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
    summary: 'Verify an email (only for common user email verification)',
  })
  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.verificationRequestService.verifyEmail(verifyEmailDto);
  }
}
