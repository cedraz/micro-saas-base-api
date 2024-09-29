import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { TestimonialConfigService } from 'src/testimonial-config/testimonial-config.service';
import { ConfigService } from '@nestjs/config';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class LandingPageService {
  constructor(
    private testimonialConfigService: TestimonialConfigService,
    private configService: ConfigService,
    private prismaService: PrismaService,
    private StripeService: StripeService,
  ) {}

  async create(createLandingPageDto: CreateLandingPageDto) {
    const adminPlan = await this.StripeService.getAdminsCurrentPlan(
      createLandingPageDto.admin_id,
    );

    const landingPageQuota = this.configService.get(
      `${adminPlan.plan}_PLAN_LANDING_PAGES_QUOTA`,
    );

    const landingPageCount = await this.count(createLandingPageDto.admin_id);

    if (landingPageCount >= landingPageQuota) {
      throw new ConflictException(
        ErrorMessagesHelper.LANDING_PAGE_LIMIT_REACHED,
      );
    }

    const testimonialConfig = await this.testimonialConfigService.findById(
      createLandingPageDto.testimonial_config_id,
    );

    if (!testimonialConfig) {
      throw new NotFoundException(
        ErrorMessagesHelper.TESTIMONIAL_CONFIG_NOT_FOUND,
      );
    }

    return this.prismaService.landingPage.create({
      data: {
        name: createLandingPageDto.name,
        link: createLandingPageDto.link,
        admin: {
          connect: {
            id: createLandingPageDto.admin_id,
          },
        },
        testimonial_config: {
          connect: {
            id: testimonialConfig.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        link: true,
        testimonial_config: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            stripe_price_id: true,
          },
        },
      },
    });
  }

  async count(admin_id: string) {
    return this.prismaService.landingPage.count({
      where: {
        admin_id,
      },
    });
  }

  findById(landing_page_id: string) {
    return this.prismaService.landingPage.findUnique({
      where: {
        id: landing_page_id,
      },
      include: {
        testimonial_config: true,
      },
    });
  }

  getLandingPageConfigService(landing_page_id: string) {
    return this.prismaService.landingPage.findUnique({
      where: {
        id: landing_page_id,
      },
      select: {
        testimonial_config: true,
      },
    });
  }
}
