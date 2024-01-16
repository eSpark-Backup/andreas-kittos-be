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
import * as otpGenerator from 'otp-generator';
import * as crypto from 'crypto';
import * as Twilio from 'twilio';


import { generateResponse, generateTOkenResponse } from 'src/utils/function/response';
const TOKEN_KEY= process.env.TOKEN_KEY
const TOKEN_EXPIRY= process.env.TOKEN_EXPIRY
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const token_expiry = process.env.TOKEN_EXPIRY;

@Injectable()
export class UserService {
  
  private twilioClient: Twilio.Twilio;

  constructor(
    private jwtService: JwtService,


    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) {

    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.twilioClient = Twilio(twilioAccountSid, twilioAuthToken);

  
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
     const otp = await this.sendOtpEmail(email);
      return {otp};
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
      return {token};
    } else {
      throw new NotFoundException('password is incorrect');
    }
  }

  createToken(payload: object) {
    const token = this.jwtService.sign(payload);
    return  token ;
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
      
      const passwordResetResponse = generateTOkenResponse('Password Reset', true, 'Password reset successfully');

      return passwordResetResponse;

    } catch (error) {


      return { success: false, message: 'Failed to reset password. Please try again later.', error };
    }
  }


  async sendOtp(phone: string): Promise<string> {
    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', process.env.OTP_KEY).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;
    const otpp = `${otp}`;

    console.log(`Your OTP is ${otp}`);
    console.log(`Hash value is ${fullHash}`);
    await this.twilioClient.messages.create({
      body: otpp + ' is your Laundary App OTP. Do not share it with anyone.',
      to: '+92' + phone,
      from: twilioPhoneNumber,
    });

    return fullHash;
  }
  

  async sendOtpEmail(email: string): Promise<string> {
    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${email}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', process.env.OTP_KEY).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;
    const otpp = `${otp}`;

    console.log(`Your OTP is ${otp}`);
    console.log(`Hash value is ${fullHash}`);
    await sendEmail(email, 'Password Reset Link', otpp);

    return fullHash;
  }

  
  async verifyOtp(phone: string, otp: string, hash: string): Promise<string> {
    try {
      const [hashValue, expires] = hash.split('.');
      const now = Date.now();

      if (now > parseInt(expires)) {
        throw new Error('OTP Expired');
      }

      const data = `${phone}.${otp}.${expires}`;
      const newCalculateHash = crypto.createHmac('sha256',process.env.OTP_KEY).update(data).digest('hex');

      if (newCalculateHash === hashValue) {
        return 'Success';
      }

      throw new Error('Invalid OTP');
    } catch (error) {
      throw new Error(error.message);
    }
  }


  async verifyOtpEmail(email: string, otp: string, hash: string): Promise<string> {
    try {
      const [hashValue, expires] = hash.split('.');
      const now = Date.now();

      if (now > parseInt(expires)) {
        throw new Error('OTP Expired');
      }

      const data = `${email}.${otp}.${expires}`;
      const newCalculateHash = crypto.createHmac('sha256',process.env.OTP_KEY).update(data).digest('hex');

      if (newCalculateHash === hashValue) {
        return 'Success';
      }

      throw new Error('Invalid OTP');
    } catch (error) {
      throw new Error(error.message);
    }
  }


}
