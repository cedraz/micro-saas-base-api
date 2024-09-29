import { PartialType } from '@nestjs/swagger';
import { CreateLandingPageDto } from './create-landing-page.dto';

export class UpdateLandingPageDto extends PartialType(CreateLandingPageDto) {}
