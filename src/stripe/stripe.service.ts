import {
  Injectable,
  NotFoundException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateStripeMobileCheckoutDto } from './dto/create-stripe-mobile-checkout.dto';
import { CreateStripeCustomerDto } from './dto/create-stripe-customer.dto';
import { UserService } from 'src/user/user.service';
import Stripe from 'stripe';
import { CreateStripeSubscriptionDto } from './dto/create-stripe-subscription.dto';
import { CreateStripeSCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

@Injectable()
export class StripeService {
  private readonly stripeApiKey: string;
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.stripeApiKey = this.configService.get('STRIPE_API_KEY');
    this.stripe = new Stripe(this.stripeApiKey, {
      apiVersion: '2024-06-20',
    });
  }

  async createCheckoutSession(
    createStripeSCheckoutSessionDto: CreateStripeSCheckoutSessionDto,
  ) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'setup',
      customer: createStripeSCheckoutSessionDto.stripe_customer_id,
      success_url: createStripeSCheckoutSessionDto.success_url,
      cancel_url: createStripeSCheckoutSessionDto.cancel_url,
    });

    return session.url;
  }

  async createSubscription(
    createStripeSubscriptionDto: CreateStripeSubscriptionDto,
  ) {
    const payments = await this.getPaymentMethods(
      createStripeSubscriptionDto.stripe_customer_id,
    );

    if (payments.data.length === 0) {
      throw new NotFoundException(ErrorMessagesHelper.NO_PAYMENT_METHODS);
    }

    return await this.stripe.subscriptions.create({
      customer: createStripeSubscriptionDto.stripe_customer_id,
      items: [
        {
          price: this.configService.get(
            `STRIPE_${createStripeSubscriptionDto.plan.toUpperCase()}_PRICE_ID`,
          ),
        },
      ],
    });
  }

  async generateInvoiceUrl(subscriptionId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId,
      {
        expand: ['items.data.price'],
      },
    );

    if (!subscription) {
      throw new NotFoundException(ErrorMessagesHelper.SUBSCRIPTION_NOT_FOUND);
    }

    const price = subscription.items.data[0].price;
    await this.stripe.invoiceItems.create({
      customer: subscription.customer as string,
      amount: price.unit_amount,
      currency: price.currency,
      description: 'Adiantamento de fatura do próximo mês',
    });

    const invoice = await this.stripe.invoices.create({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      auto_advance: false, // Não avançar automaticamente até que o pagamento seja feito
    });

    const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(
      invoice.id,
    );

    return finalizedInvoice.hosted_invoice_url;
  }

  async getSubscriptionPaymentPercentage(subscriptionId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId,
      {
        expand: ['items.data.price'],
      },
    );

    if (
      subscription.items.data[0].price.id ===
      this.configService.get('STRIPE_PREMIUM_PRICE_ID')
    ) {
      const startDate = new Date(subscription.start_date * 1000);
      const subscriptionTime = this.configService.get('STRIPE_PREMIUM_TIME'); // time in months

      const paidInvoices = await this.stripe.invoices.list({
        customer: subscription.customer as string,
        status: 'paid',
        subscription: subscriptionId,
      });

      const paidMonths = paidInvoices.data.filter((item) => item.total > 0);
    }
  }

  async getCustomerSubscriptions(customer_id: string) {
    const subscription = await this.stripe.subscriptions.list({
      customer: customer_id,
    });

    return subscription.data;
  }

  async getSubscriptionPaymentDetails(subscriptionId: string) {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    // Obtenha a data de início e a data de término do período atual da assinatura
    const startDate = new Date(subscription.start_date * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);

    console.log({
      startDate,
      endDate,
      subscription,
    });

    // Calcule o total de meses entre a data de início e a data de término
    const totalMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    // Obtenha todas as faturas pagas associadas à assinatura
    const paidInvoices = await this.stripe.invoices.list({
      customer: subscription.customer as string,
      status: 'paid',
      subscription: subscriptionId,
    });

    // Calcule o número de meses pagos com base nas faturas pagas
    const paidMonths = paidInvoices.data.length;

    return {
      totalMonths,
      paidMonths,
      subscription,
    };
  }

  async getPaymentMethods(customer_id: string) {
    return await this.stripe.paymentMethods.list({
      customer: customer_id,
    });
  }

  async createCustomer(createStripeCustomerDto: CreateStripeCustomerDto) {
    const customer = await this.getCustomerByEmail(
      createStripeCustomerDto.email,
    );

    if (customer) return customer;

    return await this.stripe.customers.create({
      email: createStripeCustomerDto.email,
      name: createStripeCustomerDto.name,
    });
  }

  async getCustomerByEmail(email: string) {
    const customer = await this.stripe.customers.list({
      email,
    });

    return customer.data[0];
  }

  async createMobileCheckout(
    createStripeMobileCheckoutDto: CreateStripeMobileCheckoutDto,
  ) {
    const user = await this.userService.findOne(
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
}
