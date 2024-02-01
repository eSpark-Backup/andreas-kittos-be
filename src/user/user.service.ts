/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, LoginDto, ResetPasswordwithMailDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entity';
import { Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../utils/function/password';
import { sendEmail } from '../utils/function/sendEmail';
import { JwtService } from '@nestjs/jwt';
import * as sgMail from '@sendgrid/mail';
import * as jwt from 'jsonwebtoken';
import * as otpGenerator from 'otp-generator';
import * as crypto from 'crypto';
import * as Twilio from 'twilio';
import { config } from 'dotenv';
config();
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';
const TOKEN_KEY = process.env.TOKEN_KEY
const OTP_KEY = process.env.OTP_KEY
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

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

    try {
      const userFind = await this.usersRepo.findOne({
        where: [
          { email: createUserDto.email },
          { phone_number: createUserDto.phone_number }
        ]
      });
      if (userFind) {
        if((createUserDto.first_name && createUserDto.last_name && createUserDto.phone_number && createUserDto.password)
        && userFind.phone_number
        ){
          const hashedPassword = hashPassword(createUserDto.password);
          const userToSave = { ...createUserDto, password: hashedPassword };
          const { affected } = await this.usersRepo.update(userFind.id,userToSave);
          if (affected === 1) {
            const token = this.createToken({ id:userFind.id, role:userFind.role })
            return {
              data: { token },
              message: CONSTANT_RESPONSE.JWT_TOEKN,
            };
          }else{
            throw new NotFoundException('phone number not found');
          }
        }
        if (!createUserDto.social_id) {
          throw new HttpException('Account  already exists with that Email', HttpStatus.CONFLICT);
        }
        if (createUserDto.social_id && createUserDto.profile_image) {
          const token = this.createToken({ id: userFind.id, role: userFind.role });
          return {
            data: { token },
            message: CONSTANT_RESPONSE.JWT_TOEKN,
          };
        }
      }
      else if (createUserDto.social_id && createUserDto.profile_image) {
        const userToSave = { ...createUserDto, is_verified: true };
        const { id, role, ...remain } = await this.usersRepo.save(userToSave);
        const token = this.createToken({ id, role })
        return {
          data: { token },
          message: CONSTANT_RESPONSE.JWT_TOEKN,
        };
      }

      //if user is not found and password && Email  is not null,which means simple SignUP with email 
      else if (createUserDto.password) {
        if (createUserDto.email) {
          const hashedPassword = hashPassword(createUserDto.password);
          const userToSave = { ...createUserDto, password: hashedPassword };
          const { email, role, ...remain } = await this.usersRepo.save(userToSave);
          const otphash = await this.sendOtpEmail(email);
          return {
            data: { otphash },
            message: CONSTANT_RESPONSE.SEND_OTP,
          };
        }
      }
    }
    catch (error) {
      return { message: error.message, status: false };
    }
    throw new NotFoundException('Something went wrong while Creating User');
  }

  async signin(loginDto: LoginDto) {
    let userFind = null;   
    if (this.isEmail(loginDto.userCred)) {
      userFind = await this.usersRepo.findOne({ where: { email: loginDto.userCred } });
    }else{
      userFind = await this.usersRepo.findOne({ where: { phone_number: loginDto.userCred } });
    }
    if (!userFind) {
      throw new NotFoundException('Account Not found with That Email');
    }
    const verifyPass = verifyPassword(loginDto.password, userFind.password);
    if (verifyPass) {
      if (userFind.is_verified === false) {
        throw new NotFoundException('you are not varified');
      }
      const token = this.createToken({ id: userFind.id, role: userFind.role });
      return {
        data: { token },
        message: CONSTANT_RESPONSE.LOGIN_SUCCESS,
      };
    }
    else {
      throw new NotFoundException('password is incorrect');
    }
  }

  createToken(payload: object) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async sendpasswordResetEmail(to: string) {
    const token = jwt.sign({ email: to }, TOKEN_KEY, { expiresIn: TOKEN_EXPIRY });
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
      await sendEmail(to, 'Password Reset Link', link);
      await this.usersRepo.update({ email: to }, { password_reset_token: token });
      return { message: CONSTANT_RESPONSE.PWD_RESET_SUCCESS };

    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  }

  async resetPasswordwithMail(resetPasswordwithMailDto: ResetPasswordwithMailDto) {
    try {
      const { password, token } = resetPasswordwithMailDto;

      const { email, exp } = jwt.verify(token, TOKEN_KEY) as { email: string, exp?: number };

      if (!exp) {
        return { message: CONSTANT_RESPONSE.INVALID_ACCESS_TOKEN, status: false };
      }

      const expirationTime = new Date(exp * 1000);
      const currentTime = new Date();

      if (currentTime >= expirationTime) {
        return { message: CONSTANT_RESPONSE.TOKEN_EXPIRED, status: false };
      }



      const user = await this.usersRepo.findOne({ where: { email } });

      if (!user) {
        return { status: false, message: CONSTANT_RESPONSE.USER_NOT_FOUND };
      }
      if (!user.password_reset_token || user.password_reset_token !== token) {
        return { status: false, message: CONSTANT_RESPONSE.LINK_EXPIRED_OR_INVALID };
      }


      const hashedPassword = hashPassword(password);
      await this.usersRepo.update(
        { email: email },
        {
          password: hashedPassword,
          password_reset_token: null,
        }
      );
      return { message: CONSTANT_RESPONSE.PASSWORD_RESET };
    } catch (error) {
      return { status: false, message: CONSTANT_RESPONSE.FAILED_TO_RESET, data: error.message };
    }
  }

  async resendEmail(email: any) {
    const userFind = await this.usersRepo.findOne({ where: { email } });
    if(userFind ){
      if (!userFind.is_verified) {
        const otphash = await this.sendOtpEmail(email);
        return {
          data: { otphash },
          message: CONSTANT_RESPONSE.RESEND_EMAIL,
        }; 
      }else{
        throw new Error('email is already varified');
      }
    }else{
      throw new Error('email is not exsist');
    }
  }

  async sendOtp(phone: string): Promise<string> {
    const userFind = await this.usersRepo.findOne({ where: { phone_number: phone, is_verified: true } })
    if (userFind) {
      throw new HttpException('Account  already exists with that Email', HttpStatus.CONFLICT);
    }
    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', OTP_KEY).update(data).digest('hex');
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
    const hash = crypto.createHmac('sha256', OTP_KEY).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;
    const otpp = `${otp}`;

    console.log(`Your OTP is ${otp}`);
    console.log(`Hash value is ${fullHash}`);
    await sendEmail(email, 'Verify Email OTP', otpp);

    return fullHash;
  }


  async verifyOtp(phone: string, otp: string, hash: string): Promise<any> {
    try {
      const [hashValue, expires] = hash.split('.');
      const now = Date.now();
      if (now > parseInt(expires)) {
        throw new Error('OTP Expired');
      }
      const data = `${phone}.${otp}.${expires}`;
      const newCalculateHash = crypto.createHmac('sha256', OTP_KEY).update(data).digest('hex');
      if (newCalculateHash === hashValue) {
        const user = new Users();
        user.phone_number = phone;
        user.is_verified = true;
        await this.usersRepo.save(user);
        return { message: CONSTANT_RESPONSE.OTP_VARIFIED };
      }
      throw new Error('Invalid OTP');
    } catch (error) {
      throw new Error(error.message);
    }
  }


  async verifyOtpEmail(email: string, otp: string, hash: string) {
    try {
      const [hashValue, expires] = hash.split('.');
      const now = Date.now();

      if (now > parseInt(expires)) {
        throw new Error('OTP Expired');
      }

      const data = `${email}.${otp}.${expires}`;
      const newCalculateHash = crypto.createHmac('sha256', OTP_KEY).update(data).digest('hex');

      if (newCalculateHash === hashValue) {
        const user = await this.usersRepo.findOne({ where: { email } });
        if (user) {
          await this.usersRepo.update(
            { email: email },
            {
              is_verified: true,
            }
          );
          const token = this.createToken({ id: user.id, role: user.role })
          return { message: CONSTANT_RESPONSE.OTP_VARIFIED, data: { token } };
        }
        else {
          throw new Error('User not found');
        }
      }

      throw new Error('Invalid OTP');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async validateUser(payload: any) {
    const { id } = payload;
    const findUser = await this.usersRepo.find({
      where: { id: id },
    });
    return findUser;
  }

  isPhoneNumber(input) {
    const phoneNumberPattern = /^(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneNumberPattern.test(input.toString());
  }

  isEmail(input: any) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(input);
  }
}
