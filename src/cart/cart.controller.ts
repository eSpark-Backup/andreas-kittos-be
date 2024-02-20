/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, } from "@nestjs/swagger";
import { JwtAuthGuard, RoleGuard } from "src/utils/guard";
import { CartService } from "./cart.service";
import { CONSTANT_RESPONSE } from "src/utils/constant/return.constant";
import { Roles } from "src/utils/decorator/role.decorator";
import { swaggerDocs } from "src/utils/decorator/swagger.decorator";
import { CartDto } from "./dto/cart.dto";
import { UserId } from "src/utils/decorator/userId.decorator";
import { Users } from "src/entity";
import { UpdateCartDTO } from "./dto/update-cart.dto";
import { simpleCartDto } from "./dto/simpleCartDto";
import { CartTransformerService } from "src/utils/decorator/transform-cart-dto.decorator";
import { SimpleUpdateDto } from "./dto/simpleUpdateDto";



@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CartController {

    constructor(private readonly cartService: CartService,
        private readonly cartTransformerService: CartTransformerService)
         { }

    @swaggerDocs({
        summary: 'Create a new Cart',
        type: simpleCartDto,
        goodResponse: { status: 201, description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.CREATE_REJECTION }
    })

    @Roles('user')
    @Post()
    async createCart(@UserId() userId: Users, @Body() simpleCart: simpleCartDto[]) {
        let simpleCartArray = Array.isArray(simpleCart) ? simpleCart : [simpleCart];
        const cartDto: CartDto = this.cartTransformerService.transformToCartDto(simpleCartArray);
        const createCartResult = await this.cartService.createCart(userId, cartDto);
        return createCartResult;

    }


    @Roles('user')
    @Get('user')
    @swaggerDocs({
        summary: 'Get Cart of User',
        type: null,
        goodResponse: { status: 200, description: CONSTANT_RESPONSE.GET_ALL },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.RECORD_NOT_FOUND }
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
        goodResponse: { status: 201, description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.UPDATE_REJECTION }
    })
    async updateCart(@Param('id') id:string,  @Body() simpleUpdateDto: SimpleUpdateDto | SimpleUpdateDto[]) {
        const updateCartDto: UpdateCartDTO = this.cartTransformerService.transformToUpdateCartDto(simpleUpdateDto);

        const updateCart = await this.cartService.updateCart(id,updateCartDto);
        return updateCart;
    }


    @Roles('user')
    @Delete(':id')
    @swaggerDocs({
        summary: 'Delete Items from the Cart Using itemId',
        type: null,
        goodResponse: { status: 201, description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.DELETE_FAILED }
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
        goodResponse: { status: 201, description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.DELETE_FAILED }
    })
    async clearCart(@Param('id') id: string) {
        const deleteCart = await this.cartService.clearCart(id);
        return deleteCart;
    }











}
