/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FavouriteService } from "./favourite.service";
import { swaggerDocs } from "src/utils/decorator/swagger.decorator";
import { addFavouriteDto } from "./dto/add-favourite.dto";


@Controller('favourite')
@ApiTags('Favourite')
export class FavouriteController {

    constructor(
        private readonly favouriteService: FavouriteService,
    ) { }

    @Post()
    @swaggerDocs({
        summary: 'Add product to favourite',
        type: addFavouriteDto,
        goodResponse: { status: 201, description: 'Product added to favourite' },
        badresponse: { status: 400, description: 'Bad Request' }
    })
    async addfavourite(@Body() addFavouriteDto: addFavouriteDto) {
        const favourite = await this.favouriteService.addFavourite(addFavouriteDto);
        return favourite;
    }

    @Get('user/:user_id')
    @swaggerDocs({
        summary: 'Get all favourite by User_Id',
        type: null,
        goodResponse: { status: 200, description: 'All favourite product of User' },
        badresponse: { status: 400, description: 'Bad Request' }
    })
    async getFavourite(@Param('user_id') user_id: string) {
        const favourite = await this.favouriteService.getFavourite(user_id);
        return favourite;
    }

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
