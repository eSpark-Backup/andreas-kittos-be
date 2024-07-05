/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entity';
import { Repository } from 'typeorm';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const checkName = await this.categoryRepository.findOne({
      where: {
        name: createCategoryDto.name,
        isDeleted: false,
      },
    });
    if (checkName) {
      return {
        data: null,
        message: 'Category already exist with that Name',
        status: false,
      };
    }
    const createResult = await this.categoryRepository.save(createCategoryDto);
    return {
      data: createResult,
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
      status: true,
    };
  }

  async findAll() {
    const allCategoryResult = await this.categoryRepository.find({
      where: { isParent: '0', isDeleted: false },
    });
    return { data: allCategoryResult, message: CONSTANT_RESPONSE.GET_ALL };
  }

  async findOne(id: string) {
    const allCategoryResult = await this.categoryRepository.findOne({
      where: { id: id, isParent: '0', isDeleted: false },
    });
    const result = allCategoryResult
      ? { data: allCategoryResult, message: CONSTANT_RESPONSE.RECORD_FOUND }
      : {
          data: allCategoryResult,
          message: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
          status: false,
        };
    return result;
  }

  async update(id: string, updateCategoryDto: Partial<CreateCategoryDto>) {
    const checkName = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name = :name', { name: updateCategoryDto.name })
      .andWhere('category.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('category.id != :id', { id })
      .getOne();

    if (checkName) {
      return {
        data: null,
        message: 'Category already exist with that Name',
        status: false,
      };
    }

    const { affected } = await this.categoryRepository.update(
      id,
      updateCategoryDto,
    );
    if (affected === 1) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
        status: true,
      };
    }
    return {
      data: null,
      message: CONSTANT_RESPONSE.UPDATE_REJECTION,
      status: false,
    };
  }

  async remove(id: string) {
    const findCategory = await this.categoryRepository.findOne({
      where: { id: id },
    });
    if (!findCategory) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
        status: false,
      };
    }
    if (findCategory.name === 'General') {
      return {
        data: null,
        message: 'Cannot delete General Category',
        status: false,
      };
    }

    const { affected } = await this.categoryRepository.update(id, {
      isDeleted: true,
    });
    if (affected === 1) {
      return { data: null, message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY };
    }
    return {
      data: null,
      message: CONSTANT_RESPONSE.DELETE_FAILED,
      status: false,
    };
  }
}
