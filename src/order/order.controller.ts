import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { Roles } from 'src/utils/decorator/role.decorator';
import { swaggerDocs } from 'src/utils/decorator/swagger.decorator';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { OrderService } from './order.service';

@Controller('order')
@ApiTags('Order')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles('user')
  @Get()
  @swaggerDocs({
    summary: 'Create New Order',
    type: null,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  create(@UserId() userId: string) {
    return this.orderService.createOrder(userId);
  }
}
