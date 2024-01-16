import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../utils/function/password';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {

  constructor(
    private jwtService: JwtService,

    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) { }

  async signUp(createUserDto: CreateUserDto) {
    const userFind = await this.usersRepo.findOne({ where: { email: createUserDto.email } })
    if (userFind && createUserDto.social_id === null) {
      throw new HttpException('email already exsist', HttpStatus.CONFLICT);
    }
    else if (userFind && createUserDto.social_id !== null) {
      const token = this.createToken({ email: userFind.email, role: userFind.role })
      return token;
    }else if(!userFind && createUserDto.social_id !== null){
      const { email, role, ...remain } = await this.usersRepo.save(createUserDto);
      const token = this.createToken({ email, role })
      return token; 
    }
    const hashedPassword = hashPassword(createUserDto.password);
    const userToSave = { ...createUserDto, password: hashedPassword };
    const { email, role, ...remain } = await this.usersRepo.save(userToSave);
    const token = this.createToken({ email, role })
    return token;
  }

  async signin(loginDto: LoginDto) {
    const userFind = await this.usersRepo.findOne({ where: { email: loginDto.email } })
    if (!userFind) {
      throw new NotFoundException('email not found');
    }
    const verifyPass = verifyPassword(loginDto.password, userFind.password);
    if (verifyPass) {
      const token = this.createToken({ email: userFind.email, role: userFind.role });
      return token;
    } else {
      throw new NotFoundException('password is incorrect');
    }
  }

  createToken(payload: object) {
    const token = this.jwtService.sign(payload);
    return { token };
  }


}
