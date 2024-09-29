export class HandleStripeWebhookDto {
  signature: string;
  rawBody: Buffer;
}
