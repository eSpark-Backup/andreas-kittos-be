import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { Roles } from 'src/utils/decorator/role.decorator';
import { swaggerDocs } from 'src/utils/decorator/swagger.decorator';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { CheckoutDto } from './dto/create-checkout.dto';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
@ApiTags('Checkout')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Roles('user')
  @Post()
  @swaggerDocs({
    summary: 'Create New Checkout',
    type: CheckoutDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  create(@UserId() userId: string, @Body() checkoutDto: CheckoutDto) {
    return this.checkoutService.create(userId, checkoutDto);
  }
}
