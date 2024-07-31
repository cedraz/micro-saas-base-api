import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';

@Injectable()
export class VerificationRequestService {
  constructor(private prismaService: PrismaService) {}

  createVerificationRequest(
    createVerificationRequestDto: CreateVerificationRequestDto,
  ) {
    return this.prismaService.verificationRequest.create({
      data: {
        identifier: createVerificationRequestDto.identifier,
        token: createVerificationRequestDto.token,
        type: createVerificationRequestDto.type,
        expires: createVerificationRequestDto.expires,
      },
    });
  }
}
