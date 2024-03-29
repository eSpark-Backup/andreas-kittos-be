import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { swaggerDocs } from 'src/utils/decorator/swagger.decorator';
import { AddressDto } from './dto/add-address.dto';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { Roles } from 'src/utils/decorator/role.decorator';
import Api from 'twilio/lib/rest/Api';

@Controller('address')
@ApiTags('Address')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Roles('user')
  @Post()
  @swaggerDocs({
    summary: 'create New Address',
    type: AddressDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  create(@UserId() userId: string, @Body() addAddressDto: AddressDto) {
    return this.addressService.create(userId, addAddressDto);
  }

  @Roles('user')
  @Get()
  @ApiQuery({ name: 'addressType', required: false })
  @swaggerDocs({
    summary: 'Get All Address of User',
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
  findAll(@Query('addressType') type: string = '', @UserId() userId: string) {
    return this.addressService.findAll(userId, type);
  }

  @Roles('user')
  @Delete(':id')
  @swaggerDocs({
    summary: 'Delete Address',
    type: null,
    goodResponse: {
      status: 200,
      description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
