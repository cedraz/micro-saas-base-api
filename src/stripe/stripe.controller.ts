import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateStripeMobileCheckoutDto } from './dto/create-stripe-mobile-checkout.dto';
import { CreateStripeSubscriptionDto } from './dto/create-stripe-subscription.dto';
import { CreateStripeSCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';

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

  @Post('subscription')
  createSubscription(
    @Body() createStripeSubscriptionDto: CreateStripeSubscriptionDto,
  ) {
    return this.stripeService.createSubscription(createStripeSubscriptionDto);
  }

  @Post('checkout-session')
  createCheckoutSession(
    @Body() createStripeSCheckoutSessionDto: CreateStripeSCheckoutSessionDto,
  ) {
    return this.stripeService.createCheckoutSession(
      createStripeSCheckoutSessionDto,
    );
  }

  @Get('subscription/:customer_id')
  getCustomerSubscription(@Param('customer_id') customer_id: string) {
    return this.stripeService.getCustomerSubscriptions(customer_id);
  }

  @Get('subscription/:subscription_id/percentage')
  getSubscriptionPaymentPercentage(
    @Param('subscription_id') subscription_id: string,
  ) {
    return this.stripeService.getSubscriptionPaymentPercentage(subscription_id);
  }

  @Get('subscription/:customer_id/:subscription_id/force-payment')
  forcePayment(@Param('subscription_id') subscription_id: string) {
    return this.stripeService.generateInvoiceUrl(subscription_id);
  }
}
