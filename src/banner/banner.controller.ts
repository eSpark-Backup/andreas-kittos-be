/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Patch,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { Roles } from 'src/utils/decorator/role.decorator';
import { swaggerDocs } from 'src/utils/decorator/swagger.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { Multer } from 'multer';
import { CreateBannerDto } from './dto/createBanner.dto';
import { BannerService } from './banner.service';
import { UpdateBannerDto } from './dto/updateBanner.dto';

@Controller('banner')
@ApiTags('Banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'Create New Banner',
    type: CreateBannerDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Multer.File,
    @Body() createBannerDTO: CreateBannerDto,
  ) {
    const createBannerResult = await this.bannerService.create(
      { fileBuffer: file?.buffer, originalName: file?.originalname },
      createBannerDTO,
    );
    file.buffer = null;
    return createBannerResult;
  }

  @Roles('admin')
  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'Update Banner',
    type: UpdateBannerDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateBanner(
    @UploadedFile() file: Multer.File,
    @Param('id') id: string,
    @Body() updateBannerDTO: UpdateBannerDto,
  ) {
    return this.bannerService.update(id, updateBannerDTO, {
      fileBuffer: file?.buffer,
      originalName: file?.originalname || undefined,
    });
  }
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'take', required: false })
  @Get()
  @swaggerDocs({
    summary: 'Get all Banners',
    type: null,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.GET_ALL,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.NOT_EXSIST,
    },
  })
  async findAll(@Query('page') page?: string, @Query('take') take?: string) {
    if (isNaN(+page) || !page || !+page) page = '1';
    if (isNaN(+take) || !take || !+take) take = '10';
    return this.bannerService.findAll(+page, +take);
  }
}
