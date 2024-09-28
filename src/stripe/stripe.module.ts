import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
  imports: [forwardRef(() => UserModule)],
})
export class StripeModule {}
