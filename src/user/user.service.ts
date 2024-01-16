/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, LoginDto, ResetPasswordwithMailDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../utils/function/password';
import { sendEmail } from '../utils/function/sendEmail';
import { JwtService } from '@nestjs/jwt';
import * as sgMail from '@sendgrid/mail';
import * as jwt from 'jsonwebtoken';
import { generateResponse, generateTOkenResponse } from 'src/utils/function/response';
const TOKEN_KEY= process.env.TOKEN_KEY
const TOKEN_EXPIRY= process.env.TOKEN_EXPIRY

@Injectable()
export class UserService {
  

  constructor(
    private jwtService: JwtService,
    


    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  }

  async signUp(createUserDto: CreateUserDto) {
    const userFind = await this.usersRepo.findOne({ where: { email: createUserDto.email } })
    if (userFind && (createUserDto.social_id === null || createUserDto.social_id === undefined)) {
      throw new HttpException('email already exsist', HttpStatus.CONFLICT);
    }
    else if (userFind && createUserDto.social_id !== null) {
      const token = this.createToken({ email: userFind.email, role: userFind.role })
      return token;
    } else if (!userFind && (createUserDto.social_id !== null && createUserDto.social_id !== undefined)) {
      const { email, role, ...remain } = await this.usersRepo.save(createUserDto);
      const token = this.createToken({ email, role })
      return token;
    }
    else if (createUserDto.password !== null && createUserDto.password !== undefined) {
      const hashedPassword = hashPassword(createUserDto.password);
      const userToSave = { ...createUserDto, password: hashedPassword };
      const { email, role, ...remain } = await this.usersRepo.save(userToSave);
      const token = this.createToken({ email, role })
      return token;
    }
    else {
      throw new HttpException('Please Provide Password to Create User', HttpStatus.BAD_REQUEST);
    }
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

  async sendpasswordResetEmail(to: string): Promise<void> {
    const token = jwt.sign({ email: to },process.env.TOKEN_KEY, { expiresIn: process.env.TOKEN_EXPIRY });
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {

      await sendEmail(to, 'Password Reset Link', link);
      await this.usersRepo.update({ email: to }, { password_reset_token: token });

    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  }

  async resetPasswordwithMail(token: string, resetPasswordwithMailDto: ResetPasswordwithMailDto) {
    try {
      const { email, exp } = jwt.verify(token, process.env.TOKEN_KEY) as { email: string, exp?: number };

      if (!exp) {
        return { error: 'Invalid access token' };
      }

      const expirationTime = new Date(exp * 1000);
      const currentTime = new Date();

      if (currentTime >= expirationTime) {
        return { error: 'Token has Expired' };
      }



      const { password } = resetPasswordwithMailDto;

      const user = await this.usersRepo.findOne({ where: { email } });

      if (!user) {
        return { success: false, message: 'User not found' };
      }
      if (!user.password_reset_token || user.password_reset_token !== token) {
        return { success: false, message: 'Password reset link is expired or invalid' };
      }


      const hashedPassword =  hashPassword(password);

      await this.usersRepo.update(
        { email: email }, 
        {
          password: hashedPassword,
          password_reset_token: null,
        }
      );
      
      const passwordResetResponse = generateTOkenResponse('Password Reset', null, 'Password reset successfully');

      return passwordResetResponse;

    } catch (error) {


      return { success: false, message: 'Failed to reset password. Please try again later.', error };
    }
  }



}
