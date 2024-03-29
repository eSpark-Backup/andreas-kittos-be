import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { CartService } from './cart.service';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { Roles } from 'src/utils/decorator/role.decorator';
import { swaggerDocs } from 'src/utils/decorator/swagger.decorator';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { Users } from 'src/entity';
import { simpleCartDto } from './dto/simpleCartDto';
import { SimpleUpdateDto } from './dto/simpleUpdateDto';

@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @swaggerDocs({
    summary: 'Create a new Cart',
    type: simpleCartDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  @Roles('user')
  @Post()
  async createCart(
    @UserId() userId: Users,
    @Body() simpleCart: simpleCartDto[],
  ) {
    const createCartResult = await this.cartService.createCart(
      userId,
      simpleCart,
    );
    return createCartResult;
  }

  @Roles('user')
  @Get('user')
  @swaggerDocs({
    summary: 'Get Cart of User',
    type: null,
    goodResponse: { status: 200, description: CONSTANT_RESPONSE.GET_ALL },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  async getCart(@UserId() userId: string) {
    const cart = await this.cartService.getCart(userId);
    return cart;
  }

  @Roles('user')
  @Put('update/:id')
  @swaggerDocs({
    summary: 'Update Cart',
    type: SimpleUpdateDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  async updateCart(
    @Param('id') id: string,
    @Body() simpleUpdateDto: SimpleUpdateDto | SimpleUpdateDto[],
  ) {
    const updateCart = await this.cartService.updateCart(id, simpleUpdateDto);
    return updateCart;
  }

  @Roles('user')
  @Delete(':id')
  @swaggerDocs({
    summary: 'Delete Items from the Cart Using itemId',
    type: null,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
    },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.DELETE_FAILED },
  })
  async deleteItem(@Param('id') id: string) {
    const deleteCart = await this.cartService.deleteItem(id);
    return deleteCart;
  }

  @Roles('user')
  @Delete('clear/:id')
  @swaggerDocs({
    summary: 'Clear the Cart',
    type: null,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
    },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.DELETE_FAILED },
  })
  async clearCart(@Param('id') id: string) {
    const deleteCart = await this.cartService.clearCart(id);
    return deleteCart;
  }
}
