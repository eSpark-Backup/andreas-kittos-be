/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// static.controller.ts
import { Controller, Get, Post, Body, UseGuards, Param, Put, Delete } from '@nestjs/common';
import { Static } from 'src/entity/static.entity';
import { StaticDTO } from './dto/create-static.dto';
import { StaticService } from './static.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { swaggerDocs } from 'src/utils/decorator/swagger.decorator';
import { Roles } from 'src/utils/decorator/role.decorator';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { updateStaticDTO } from './dto/update-static.dto';

@Controller('static')
@ApiTags('static')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class StaticController {
    constructor(private readonly staticService: StaticService) { }

    @Roles('user')
    @Get(':id')
    async getStaticDataById(@Param('id') id: string) {
        return this.staticService.findOne(id);
    }

    @swaggerDocs({
        summary: 'Create static Data',
        type: StaticDTO,
        goodResponse: { status: 201, description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.CREATE_REJECTION }
    })
    @Roles('admin')
    @Post()
    async createStaticData(@Body() staticData: StaticDTO) {
        return this.staticService.createStaticData(staticData);

    }

    @swaggerDocs({
        summary: 'Update static Data',
        type: updateStaticDTO,
        goodResponse: { status: 201, description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.UPDATE_REJECTION }
    })
    @Roles('admin')
    @Put(':id')
    async updateStaticData(@Param('id') id: string, @Body() updateStaticDTO: updateStaticDTO) {
        return this.staticService.updateStaticData(id, updateStaticDTO);
    }


    @Delete(':id')
    @Roles('admin')
    @swaggerDocs({
        summary: 'Delete static Data',
        type: null,
        goodResponse: { status: 201, description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY },
        badresponse: { status: 400, description: CONSTANT_RESPONSE.DELETE_FAILED }
    })
    async deleteStaticData(@Param('id') id: string) {
        return this.staticService.deleteStaticData(id);
    }

    @Roles('user')
    @Get()
    async getStaticData() {
        return this.staticService.findAll();
    }
}
