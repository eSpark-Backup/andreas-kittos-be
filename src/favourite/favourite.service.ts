/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Favourite, Users } from 'src/entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FavouriteDto } from './dto/add-favourite.dto';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';

@Injectable()
export class FavouriteService {
    @InjectRepository(Favourite)
    private favouriteRepo: Repository<Favourite>


    async addFavourite(addFavouriteDto: FavouriteDto, userId: Users) {
        const { productId } = addFavouriteDto;
        const existingFavorite = await this.favouriteRepo
            .createQueryBuilder('favourite')
            .where('favourite.userId = :userId', { userId })
            .andWhere('favourite.productId = :productId', { productId })
            .getOne();
        if (existingFavorite) {
            return {
                message: CONSTANT_RESPONSE.ALREADY_EXSIST,

            };
        }
        addFavouriteDto.userId = userId;
        const result = await this.favouriteRepo.save(addFavouriteDto);
        return {
            data: result,
            message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,

        };
    }


    async removeFromFavourite(addFavouriteDto: FavouriteDto, userId: Users) {
        const { productId } = addFavouriteDto;
        await this.favouriteRepo
        .createQueryBuilder()
        .delete()
        .from(Favourite) // Replace FavouriteEntity with your actual entity name
        .where('userId = :userId', { userId })
        .andWhere('productId = :productId', { productId })
        .execute();

    return {
        message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
    };


    }

    async removeFavourite(id: string) {
        const result = await this.favouriteRepo.delete(id);
        return {
            data: result,
            message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
        };
    }

    async getByProductId(productId: string) {
        const favourite = await this.favouriteRepo
            .createQueryBuilder('favourite')
            .where('favourite.productId = :productId', { productId })
            .getManyAndCount();

        if (!favourite) {
            return {
                data: [],
                message: CONSTANT_RESPONSE.NOT_EXSIST,
            };
        }
        else {
            return {
                data: favourite,
                message: CONSTANT_RESPONSE.GET_ALL,
            };
        }
    }

    async getFavourite(userId: string) {
        const favourites = await this.favouriteRepo
            .createQueryBuilder('favourite')
            .leftJoinAndSelect('favourite.productId', 'product')
            .where('favourite.userId = :userId', { userId })
            .getMany();

        if (!favourites) {
            return {
                data: [],
                message: CONSTANT_RESPONSE.NOT_EXSIST,
            };
        }
        else {

            return {
                data: favourites,
                message: CONSTANT_RESPONSE.GET_ALL,
            };
        }
    }


}
