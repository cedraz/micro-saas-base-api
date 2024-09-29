import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateStripeMobileCheckoutDto } from './dto/create-stripe-mobile-checkout.dto';
import { CreateStripeSCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';
import { Request } from 'express';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  createStripeMobileCheckout(
    @Body() createStripeMobileCheckout: CreateStripeMobileCheckoutDto,
  ) {
    return this.stripeService.createMobileCheckout(createStripeMobileCheckout);
  }

  @Post('checkout-session')
  createCheckoutSession(
    @Body() createStripeSCheckoutSessionDto: CreateStripeSCheckoutSessionDto,
  ) {
    return this.stripeService.createCheckoutSession(
      createStripeSCheckoutSessionDto,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.stripeService.handleWebhook({
      signature,
      rawBody: request.rawBody,
    });
  }
}
