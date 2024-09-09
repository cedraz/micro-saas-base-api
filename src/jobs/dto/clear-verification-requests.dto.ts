import { VerificationRequest } from 'src/verification-request/entity/verification-request.entity';

export class ClearVerificationRequestsDto {
  expiredVerificationRequests: VerificationRequest[];
}
