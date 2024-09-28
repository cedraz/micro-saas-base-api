import Stripe from 'stripe';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { CreateStripeMobileCheckoutDto } from './dto/create-stripe-mobile-checkout.dto';
import { CreateStripeCustomerDto } from './dto/create-stripe-customer.dto';
import { CreateStripeSCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';
import dayjs from 'dayjs';
import { HandleStripeWebhookDto } from './dto/handle-stripe-webhook.dto';

@Injectable()
export class StripeService {
  private readonly stripeApiKey: string;
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {
    this.stripeApiKey = this.configService.get('STRIPE_API_KEY');
    this.stripe = new Stripe(this.stripeApiKey, {
      apiVersion: '2024-06-20',
    });
  }

  async getCustomerByEmail(email: string) {
    const customer = await this.stripe.customers.list({
      email,
    });

    return customer.data[0];
  }

  async createCustomer(createStripeCustomerDto: CreateStripeCustomerDto) {
    const customer = await this.getCustomerByEmail(
      createStripeCustomerDto.email,
    );

    if (customer) return customer;

    const createdCustomer = await this.stripe.customers.create({
      email: createStripeCustomerDto.email,
      name: createStripeCustomerDto.name,
    });

    const priceId = this.configService.get(`STRIPE_FREE_PRICE_ID`);

    const subscription = await this.stripe.subscriptions.create({
      customer: createdCustomer.id,
      items: [
        {
          price: priceId,
        },
      ],
    });

    await this.userService.update(createStripeCustomerDto.user_id, {
      stripe_customer_id: createdCustomer.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      stripe_subscription_status: subscription.status,
    });

    return createdCustomer;
  }

  async createCheckoutSession(
    createStripeSCheckoutSessionDto: CreateStripeSCheckoutSessionDto,
  ) {
    const subscription = await this.stripe.subscriptionItems.list({
      subscription: createStripeSCheckoutSessionDto.stripe_subscription_id,
      limit: 1,
    });

    const session = await this.stripe.billingPortal.sessions.create({
      customer: createStripeSCheckoutSessionDto.stripe_customer_id,
      return_url: 'https://www.youtube.com/?themeRefresh=1',
      flow_data: {
        type: 'subscription_update_confirm',
        after_completion: {
          type: 'redirect',
          redirect: {
            return_url: 'https://www.youtube.com/?themeRefresh=1',
          },
        },
        subscription_update_confirm: {
          subscription: createStripeSCheckoutSessionDto.stripe_subscription_id,
          items: [
            {
              id: subscription.data[0].id,
              price: this.configService.get('STRIPE_PREMIUM_PRICE_ID'),
              quantity: 1,
            },
          ],
        },
      },
    });

    return {
      url: session.url,
    };
  }

  async createMobileCheckout(
    createStripeMobileCheckoutDto: CreateStripeMobileCheckoutDto,
  ) {
    const user = await this.userService.findById(
      createStripeMobileCheckoutDto.user_id,
    );

    const customer = await this.createCustomer({
      email: createStripeMobileCheckoutDto.email,
      name: user.name,
    });

    const ephemeralKey = await this.stripe.ephemeralKeys.create({
      customer: customer.id,
    });

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: createStripeMobileCheckoutDto.amount,
      currency: createStripeMobileCheckoutDto.currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Desabilita redirecionamentos automáticos
      },
      description: createStripeMobileCheckoutDto.description,
      receipt_email: createStripeMobileCheckoutDto.email,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      checkout_data: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        email: createStripeMobileCheckoutDto.email,
        customer_id: customer.id,
      },
    };
  }

  async getUsersCurrentPlan(user_id: string) {
    const usersStripeInfo = await this.userService.getUsersStripeInfo(user_id);

    const subscription = await this.stripe.subscriptions.retrieve(
      usersStripeInfo.stripe_subscription_id,
    );

    const endDate = new Date(subscription.current_period_end * 1000);

    const daysRemaining = dayjs(endDate).diff(dayjs(), 'days');

    const freePlan = this.configService.get('STRIPE_FREE_PRICE_ID');

    return {
      plan: usersStripeInfo.stripe_price_id === freePlan ? 'free' : 'premium',
      daysRemaining,
      endDate,
    };
  }

  async handleWebhook(handleStripeWebhookDto: HandleStripeWebhookDto) {
    const { signature, rawBody } = handleStripeWebhookDto;

    const stripeEvent = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET'),
    );

    switch (stripeEvent.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionProcess({
          object: stripeEvent.data.object as Stripe.Subscription,
        });
        break;
      default:
        return;
    }
  }

  async handleSubscriptionProcess(event: { object: Stripe.Subscription }) {
    const stripe_customer_id = event.object.customer as string;
    const stripe_subscription_id = event.object.id as string;
    const stripe_subscription_status = event.object.status;
    const stripe_price_id = event.object.items.data[0].price.id;

    console.log({
      stripe_customer_id,
      stripe_subscription_id,
      stripe_subscription_status,
      stripe_price_id,
    });

    const userExists = await this.userService.findUserByStripeInfo({
      stripe_customer_id,
      stripe_subscription_id,
    });

    if (!userExists) {
      throw new Error('user of stripeCustomerId not found');
    }

    await this.userService.update(userExists.id, {
      stripe_price_id,
      stripe_subscription_id,
      stripe_subscription_status,
    });
  }
}
