import { Controller, Post, Body } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('landing-page')
@Controller('landing-page')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Post()
  create(@Body() createLandingPageDto: CreateLandingPageDto) {
    return this.landingPageService.create(createLandingPageDto);
  }
}
