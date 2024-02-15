/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Favourite } from '../entity/favourite.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { addFavouriteDto } from './dto/add-favourite.dto';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';

@Injectable()
export class FavouriteService {
    @InjectRepository(Favourite)
    private favouriteRepo: Repository<Favourite>


    async addFavourite(addFavouriteDto: addFavouriteDto) {
        const { user_id, product_id } = addFavouriteDto;

       
            const existingFavorite = await this.favouriteRepo
                .createQueryBuilder('favourite')
                .where('favourite.user_id = :user_id', { user_id })
                .andWhere('favourite.product_id = :product_id', { product_id })
                .getOne();
    
        

        if (existingFavorite) {
            return {
               
                message: CONSTANT_RESPONSE.ALREADY_EXSIST,
    
            };
        }
        const result = await this.favouriteRepo.save(addFavouriteDto);
        return {
            data: result,
            message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,

        };
    }

  

    

    async removeFavourite(id: string) {
        const result = await this.favouriteRepo.delete(id);
        return {
            data: result,
            message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
        };
    }

    async getByProductId(product_id: string) {
        const favourite = await this.favouriteRepo
            .createQueryBuilder('favourite')
            .where('favourite.product_id = :product_id', { product_id })
            .getManyAndCount();

            if (!favourite) {
                return {
                    data: [],
                    message: CONSTANT_RESPONSE.NOT_EXSIST,
                };
            }
            else{
        return {
            data: favourite,
            message: CONSTANT_RESPONSE.GET_ALL,
        };
    }
    }
    
    async getFavourite(user_id: string) {
        const favourites = await this.favouriteRepo
            .createQueryBuilder('favourite')
            .leftJoinAndSelect('favourite.product_id', 'product')
            .where('favourite.user_id = :user_id', { user_id })
            .getMany();

            if (!favourites) {
                return {
                    data: [],
                    message: CONSTANT_RESPONSE.NOT_EXSIST,
                };
            }
            else{
    
        return {
            data: favourites,
            message: CONSTANT_RESPONSE.GET_ALL,
        };
    }
    }


}
