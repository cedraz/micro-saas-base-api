import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { CompleteTestimonialDto } from './dto/complete-testimonial.dto';
import { GPTMock } from 'src/services/open-ai';
import { LandingPageService } from 'src/landing-page/landing-page.service';

@Injectable()
export class TestimonialService {
  constructor(
    private configService: ConfigService,
    private stripeService: StripeService,
    private prismaService: PrismaService,
    private landingPageService: LandingPageService,
  ) {}

  async createTestimonialLink(createTestimonialDto: CreateTestimonialDto) {
    const adminPlan = await this.stripeService.getAdminsCurrentPlan(
      createTestimonialDto.admin_id,
    );

    const testimonialQuota = this.configService.get(
      `${adminPlan.plan}_PLAN_TESTIMONIAL_QUOTA`,
    );

    const testimonialCount = await this.count(
      createTestimonialDto.landing_page_id,
    );

    if (testimonialCount >= testimonialQuota) {
      throw new ConflictException(
        ErrorMessagesHelper.TESTIMONIAL_LIMIT_REACHED,
      );
    }

    return this.prismaService.testimonial.create({
      data: {
        landing_page: {
          connect: {
            id: createTestimonialDto.landing_page_id,
          },
        },
        status: 'PENDING',
      },
    });
  }

  async completeTestimonial(
    testimonial_id: string,
    completeTestimonialDto: CompleteTestimonialDto,
  ) {
    const testimonial = await this.findById(testimonial_id);

    if (!testimonial)
      throw new NotFoundException(ErrorMessagesHelper.TESTIMONIAL_NOT_FOUND);

    const { testimonial_config } =
      await this.landingPageService.getLandingPageConfigService(
        testimonial.landing_page_id,
      );

    if (!testimonial_config)
      throw new NotFoundException(
        ErrorMessagesHelper.TESTIMONIAL_CONFIG_NOT_FOUND,
      );

    const testimonialConfigExpirationLimit = new Date(
      testimonial_config.expiration_limit * 24 * 60 * 60 * 1000,
    );

    if (testimonialConfigExpirationLimit < new Date())
      throw new ConflictException(ErrorMessagesHelper.TESTIMONIAL_EXPIRED);

    if (
      completeTestimonialDto.message.length >
      testimonial_config.message_char_limit
    )
      throw new BadRequestException(
        ErrorMessagesHelper.MESSAGE_CHAR_LIMIT_EXCEEDED,
      );

    if (
      completeTestimonialDto.title.length > testimonial_config.title_char_limit
    )
      throw new BadRequestException(
        ErrorMessagesHelper.TITLE_CHAR_LIMIT_EXCEEDED,
      );

    const adminPlan = await this.stripeService.getAdminsCurrentPlan(
      testimonial.landing_page.admin_id,
    );

    const testimonialQuota = this.configService.get(
      `${adminPlan.plan}_PLAN_TESTIMONIALS_QUOTA`,
    );

    const testimonialCount = await this.count(testimonial.landing_page_id);

    if (testimonialCount >= testimonialQuota) {
      throw new ConflictException(
        ErrorMessagesHelper.TESTIMONIAL_LIMIT_REACHED,
      );
    }

    let status: 'APPROVED' | 'REJECTED' = 'APPROVED';

    if (adminPlan.plan === 'PREMIUM') {
      const gptMock = await GPTMock({
        prompt: completeTestimonialDto.message,
      });

      if (gptMock.data.choices[0].text.includes('bad')) {
        status = 'REJECTED';
      }
    }

    return this.prismaService.testimonial.update({
      where: {
        id: testimonial_id,
      },
      data: {
        status,
        customer_name: completeTestimonialDto.customer_name,
        message: completeTestimonialDto.message,
        stars: completeTestimonialDto.stars,
        title: completeTestimonialDto.title,
      },
    });
  }

  async count(landing_page_id: string) {
    return this.prismaService.testimonial.count({
      where: {
        landing_page_id,
      },
    });
  }

  async findById(testimonial_id: string) {
    return this.prismaService.testimonial.findUnique({
      where: {
        id: testimonial_id,
      },
      include: {
        landing_page: {
          select: {
            admin_id: true,
          },
        },
      },
    });
  }
}
