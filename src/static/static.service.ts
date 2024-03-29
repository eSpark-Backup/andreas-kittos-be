import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaticDTO } from './dto/create-static.dto';
import { Static } from 'src/entity/static.entity';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { updateStaticDTO } from './dto/update-static.dto';

@Injectable()
export class StaticService {
  constructor(
    @InjectRepository(Static)
    private readonly staticRepository: Repository<Static>,
  ) {}

  async findOne(id: string) {
    const staticData = await this.staticRepository.findOne({
      where: { id: id },
    });
    if (!staticData) {
      return {
        data: [],
        message: CONSTANT_RESPONSE.NOT_EXSIST,
      };
    }
    return {
      data: staticData,
      message: CONSTANT_RESPONSE.GET_ALL,
    };
  }
  async findAll() {
    try {
      const staticData = await this.staticRepository.find();

      return {
        data: staticData,
        message: CONSTANT_RESPONSE.GET_ALL,
      };
    } catch (error) {
      return {
        data: [],
        message: CONSTANT_RESPONSE.NOT_EXSIST,
      };
    }
  }

  async createStaticData(staticData: StaticDTO) {
    await this.staticRepository.save(staticData);
    return {
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    };
  }

  async updateStaticData(id: string, updateStaticDTO: updateStaticDTO) {
    const staticDataExist = await this.staticRepository.findOne({
      where: { id: id },
    });
    if (!staticDataExist) {
      return {
        message: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
      };
    } else {
      await this.staticRepository.update(id, updateStaticDTO);
      return {
        message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
      };
    }
  }
  async deleteStaticData(id: string) {
    const staticDataExist = await this.staticRepository.findOne({
      where: { id: id },
    });
    if (!staticDataExist) {
      return {
        message: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
      };
    } else {
      await this.staticRepository.delete(id);
      return {
        message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
      };
    }
  }
}
