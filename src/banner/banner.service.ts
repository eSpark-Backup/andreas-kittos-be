/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BackblazeService } from "src/backblaze/backblaze.service";
import { Banner } from "src/entity/banner.entity";
import { CONSTANT_RESPONSE } from "src/utils/constant/return.constant";
import { Repository } from "typeorm";
import { UpdateBannerDto } from "./dto/updateBanner.dto";
import * as url from 'url';
import * as path from 'path';
import { paginateResponse } from "src/utils/function/pagination";

@Injectable()
export class BannerService{
    constructor(
        private readonly backBlazeService: BackblazeService,
        @InjectRepository(Banner)
        private bannerRepository: Repository<Banner>,
    ) { }

    async create(file: any, createBannerDto: any) {
        const uploadResult = await this.backBlazeService.uploadFileFromBuffer(
            file.fileBuffer,
            file.originalName,
        );
        createBannerDto.bannerImage = uploadResult.url;
        createBannerDto.imageKey = uploadResult.fileId;
        const createBannerRes = await this.bannerRepository.save(createBannerDto);
        return {
            message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
            data: createBannerRes
        };
    }
    async findAll(page:number,take:number){
      const queryToGetData = this.bannerRepository.createQueryBuilder('banner');
      const queryToGetCount = this.bannerRepository.createQueryBuilder('banner');
      const skip = (page - 1) * take;

      const [query, totalCount] = await Promise.all([
        queryToGetData
          .take(take)
          .skip(skip)
          .getMany(),
        queryToGetCount.getCount(),
      ]);

      return {
        data:paginateResponse({query, totalCount, page, take}),
        message: CONSTANT_RESPONSE.RECORD_FOUND,
      }
    
    }

    async update(id:string, updateBannerDto:UpdateBannerDto,file:any){
        const result = await this.bannerRepository.findOne({
            where: { id }
        })
        if (!result) {
            return {
              data: null,
              message: CONSTANT_RESPONSE.UPDATE_REJECTION,
              status: false,
            };
          }
        if(file.originalName !== undefined){
            const deletePromise = this.backBlazeService.deleteFile(
                path.basename(url.parse(result.bannerImage).pathname),
                result.imageKey,
            );
    
            const uploadPromise = this.backBlazeService.uploadFileFromBuffer(
                file.fileBuffer,
                file.originalName,
            );
            const [deleteResult, uploadResult] = await Promise.all([deletePromise, uploadPromise]);


            updateBannerDto.bannerImage = uploadResult.url;
            updateBannerDto.imageKey = uploadResult.fileId;
        }
        const {affected} = await this.bannerRepository.update(id,updateBannerDto);
        if(affected ===1){
            return {
                data: null,
                message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
                status: true
            };
        }
        return {
            data: null,
            message: CONSTANT_RESPONSE.UPDATE_REJECTION,
            status: false
        };


    }

    async remove (id:string){

        const result = await this.bannerRepository.findOne({
            where: { id },
          });
      
          if (!result) {
            return {
              data: null,
              message: CONSTANT_RESPONSE.DELETE_FAILED,
              status: false,
            };
          }

          await this.backBlazeService.deleteFile(
            path.basename(url.parse(result.bannerImage).pathname),
            result.imageKey,
          );
        const {affected} = await this.bannerRepository.delete(id);

        if(affected ===1){
            return {
                data:null,
                message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
                status: true
            };
        }
        return {
            data:null,
            message: CONSTANT_RESPONSE.DELETE_FAILED,
            status: false
        };
    }
}