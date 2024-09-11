/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  SwaggerModule,
} from '@nestjs/swagger';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { Roles } from 'src/utils/decorator/role.decorator';
import { swaggerDocs } from 'src/utils/decorator/swagger.decorator';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto } from './dto/update-orderStatus.dto';
import { CreateOrderDto } from './dto/create.order';
import { orderByState } from 'src/entity/order.entity';
@Controller('order')
@ApiTags('Order')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles('user')
  @Post('create-order')
  @swaggerDocs({
    summary: 'Create New Order',
    type: CreateOrderDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  create(@UserId() userId: string, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Roles('admin')
  @Put('status/:id')
  @swaggerDocs({
    summary: 'Update Order Status(Admin Access)',
    type: UpdateOrderStatusDto,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  updateStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(orderId, updateOrderStatusDto);
  }

  @Roles('admin')
  @Get('order-list')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'orderState', required: false, enum: orderByState })
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    enum: ['pending', 'failed', 'success'],
  })
  @ApiQuery({ name: 'paymentType', required: false, enum: ['COD', 'CARD'] })
  @ApiQuery({ name: 'Order#/Name/Email', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @swaggerDocs({
    summary: 'Get List of Total Orders(Admin Access)',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.GET_ALL,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  orderList(
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('userId') userId?: string,
    @Query('orderState') orderState?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('paymentType') paymentType?: string,
    @Query('Order#/Name/Email') customerName?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (isNaN(+page) || !page || !+page) page = '1';
    if (isNaN(+take) || !take || !+take) take = '10';
    return this.orderService.orderList(
      +page,
      +take,
      userId,
      orderState,
      paymentStatus,
      paymentType,
      startDate,
      endDate,
      customerName,
    );
  }

  @Roles('user')
  @Get('order-list-user')
  @swaggerDocs({
    summary: 'Get List of Total Orders for User',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.GET_ALL,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'orderState', required: false, enum: orderByState })
  userOrderDetail(
    @UserId() userId: string,
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('orderState') orderState?: string,
  ) {
    if (isNaN(+page) || !page || !+page) page = '1';
    if (isNaN(+take) || !take || !+take) take = '10';
    return this.orderService.userOrderDetail(userId, +page, +take, orderState);
  }
  @Roles('user')
  @Put('cancel-order/:orderId')
  @swaggerDocs({
    summary: 'Cancel Order',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  cancelOrder(@UserId() userId: string, @Param('orderId') orderId: string) {
    return this.orderService.cancelOrder(userId, orderId);
  }

  @Roles('user')
  @Get('order-detail/:orderId')
  @swaggerDocs({
    summary: 'Get Order Detail',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.GET_ALL,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  orderDetail(@Param('orderId') orderId: string) {
    return this.orderService.orderDetail(orderId);
  }

  @Roles('admin')
  @Put('payment-status/:id')
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    enum: ['pending', 'failed', 'success'],
  })
  @ApiQuery({ name: 'paymentType', required: false, enum: ['COD', 'CARD'] })
  @swaggerDocs({
    summary: 'Update Payment Status',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  updatePaymentStatus(
    @Param('id') orderId: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('paymentType') paymentType?: string,
  ) {
    return this.orderService.paymentStatus(orderId, paymentStatus, paymentType);
  }

  @Roles('user')
  @Get('order-status-list')
  @swaggerDocs({
    summary: 'Get Order Status List',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.GET_ALL,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.NOT_EXSIST,
    },
  })
  orderStatusList() {
    return this.orderService.orderStatusList();
  }

  @Roles('admin')
  @Get('dashboard')
  @swaggerDocs({
    summary: 'Get Dashboard Data',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.GET_ALL,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.NOT_EXSIST,
    },
  })
  dashboardData() {
    return this.orderService.dashboardData();
  }

  @Roles('admin')
  @Get('chart')
  @swaggerDocs({
    summary: 'Get Chart Data for Orders',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.GET_ALL,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.NOT_EXSIST,
    },
  })
  chartData() {
    return this.orderService.chartData();
  }
}
