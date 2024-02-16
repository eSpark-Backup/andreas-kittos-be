/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FavouriteService } from "./favourite.service";
import { swaggerDocs } from "src/utils/decorator/swagger.decorator";
import { FavouriteDto } from "./dto/add-favourite.dto";
import { JwtAuthGuard, RoleGuard } from "src/utils/guard";
import { UserId } from "src/utils/decorator/userId.decorator";
import { Roles } from "src/utils/decorator/role.decorator";
import { Users } from "src/entity";


@Controller('favourite')
@ApiTags('Favourite')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class FavouriteController {

    constructor(
        private readonly favouriteService: FavouriteService,
    ) { }
    @Roles('user')
    @Post('add')
    @swaggerDocs({
        summary: 'Add product to favourite',
        type: FavouriteDto,
        goodResponse: { status: 201, description: 'Product added to favourite' },
        badresponse: { status: 400, description: 'Bad Request' }
    })
    async addfavourite(@Body() FavouriteDto: FavouriteDto,@UserId() userId: Users) {
        const favourite = await this.favouriteService.addFavourite(FavouriteDto,userId);
        return favourite;
    }

    @Roles('user')
    @Post('remove')
    @swaggerDocs({
        summary: 'Add product to favourite',
        type: FavouriteDto,
        goodResponse: { status: 201, description: 'Product added to favourite' },
        badresponse: { status: 400, description: 'Bad Request' }
    })
    async removefavourite(@Body() FavouriteDto: FavouriteDto,@UserId() userId: Users) {
        const favourite = await this.favouriteService.removeFromFavourite(FavouriteDto,userId);
        return favourite;
    }

    @Roles('user')
    @Get('user')
    @swaggerDocs({
        summary: 'Get all favourite of User',
        type: null,
        goodResponse: { status: 200, description: 'All favourite product of User' },
        badresponse: { status: 400, description: 'Bad Request' }
    })
    async getFavourite(@UserId() userId: string) {
        const favourite = await this.favouriteService.getFavourite(userId);
        return favourite;
    }
    @Roles('admin')
    @Get('product/:product_id')
    @swaggerDocs({
        summary: 'Get all favourite product_id',
        type: null,
        goodResponse: { status: 200, description: 'All favourite product by ProductId' },
        badresponse: { status: 400, description: 'Bad Request' }
    })
    async getByProductId(@Param('product_id') product_id: string) {
        const favourite = await this.favouriteService.getByProductId(product_id);
        return favourite;
    }


    @Roles('user')
    @Delete(':id')
    @swaggerDocs({
        summary: 'Remove product from favourite',
        type: null,
        goodResponse: { status: 201, description: 'Product removed from favourite' },
        badresponse: { status: 400, description: 'Bad Request' }
    })
    async removeFavourite(@Param('id') id: string) {
        const favourite = await this.favouriteService.removeFavourite(id);
        return favourite;
    }





}
