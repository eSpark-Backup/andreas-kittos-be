import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';
import { swaggerDocs } from '../utils/decorator/swagger.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('category')
@ApiTags('Categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @swaggerDocs({
    summary: 'create category',
    type: CreateCategoryDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @swaggerDocs({
    summary: 'get all category',
    type: null,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.GET_ALL },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @swaggerDocs({
    summary: 'get by id',
    type: null,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.RECORD_FOUND },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @swaggerDocs({
    summary: 'update category',
    type: CreateCategoryDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @swaggerDocs({
    summary: 'update category',
    type: null,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
    },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.DELETE_FAILED },
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
