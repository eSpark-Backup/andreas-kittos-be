/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  LoginDto,
  ResetPasswordwithMailDto,
  UpdateUserDto,
} from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entity';
import { Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../utils/function/password';
import { sendEmail } from '../utils/function/sendEmail';
import { JwtService } from '@nestjs/jwt';
import * as sgMail from '@sendgrid/mail';
import * as otpGenerator from 'otp-generator';
import * as crypto from 'crypto';
import * as Twilio from 'twilio';
import { config } from 'dotenv';
config();
import * as url from 'url';
import * as path from 'path';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';
import { updateProfileImageDto } from './dto/update-profileImage.dto';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { emailTemplate } from 'src/utils/Static html/resetPassword';
import { welcomeEmailTemplate} from 'src/utils/Static html/welcomeEmail';
import { Pagination } from 'nestjs-typeorm-paginate';
import { paginateResponse } from 'src/utils/function/pagination';
import { userStatusDto } from './dto/change.userStatus.dto';
import { ChangePasswordDto } from './dto/change.password.dto';
import { resendEmailTemplate } from 'src/utils/Static html/resendEmail';
const OTP_KEY = process.env.OTP_KEY;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const TTL = process.env.OTP_TTL;

@Injectable()
export class UserService {
  private twilioClient: Twilio.Twilio;

  constructor(
    private readonly backblazeService: BackblazeService,
    private jwtService: JwtService,
    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.twilioClient = Twilio(twilioAccountSid, twilioAuthToken);
  }
async deleteUser(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(CONSTANT_RESPONSE.NOT_EXSIST);
    }
    await this.usersRepo.delete(userId);
    return { message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY };
  }

  async changePassword(userId:string,changePasswordDto:ChangePasswordDto)
  {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(CONSTANT_RESPONSE.NOT_EXSIST);
    }
    const verifyPass = verifyPassword(changePasswordDto.oldPassword, user.password);
    if (verifyPass) {
      if(changePasswordDto.oldPassword === changePasswordDto.newPassword)
      {
        throw new NotFoundException('Old password and new password cannot be same');
      }
      const hashedPassword = hashPassword(changePasswordDto.newPassword);

      await this.usersRepo.update(userId, { password: hashedPassword });
      return { message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY };
    } else {
      throw new NotFoundException('Old password is incorrect');
    }
  }

  async changeUserStatus(userId: string, userStatusDto: userStatusDto) {

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(CONSTANT_RESPONSE.NOT_EXSIST);
    }
    await this.usersRepo.update(userId, { userStatus: userStatusDto.userStatus });
    return { message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY };
  }
  async signUp(createUserDto: CreateUserDto) {
    try {
      const userFind = await this.usersRepo.findOne({
        where: [
          { email: createUserDto.email },
          { phoneNumber: createUserDto.phoneNumber },
        ],
      });
      if (userFind) {
        if (
          createUserDto.firstName &&
          createUserDto.lastName &&
          createUserDto.phoneNumber &&
          createUserDto.password &&
          userFind.phoneNumber &&
          !userFind.password
        ) {
          const hashedPassword = hashPassword(createUserDto.password);
          const userToSave = { ...createUserDto, password: hashedPassword };
          const { affected } = await this.usersRepo.update(
            userFind.id,
            userToSave,
          );
          if (affected === 1) {
            const userObject = this.createToken(
              { id: userFind.id, role: userFind.role },
              userToSave,
              false,
            );
            return {
              data: { userObject },
              message: CONSTANT_RESPONSE.JWT_TOEKN,
            };
          } else {
            throw new NotFoundException('phone number not found');
          }
        }
        if (!createUserDto.socialId) {
          throw new HttpException(
            CONSTANT_RESPONSE.ALREADY_EXSIST,
            HttpStatus.CONFLICT,
          );
        }
        if (createUserDto.socialId && createUserDto.profileImage) {
          const userObject = this.createToken(
            { id: userFind.id, role: userFind.role },
            userFind,
            true,
          );
          return {
            data: { userObject },
            message: CONSTANT_RESPONSE.JWT_TOEKN,
          };
        }
      } else if (createUserDto.socialId && createUserDto.profileImage) {
        const userToSave = { ...createUserDto, isVerified: true };
        const { id, role, ...remain } = await this.usersRepo.save(userToSave);
        const userObject = this.createToken({ id, role }, remain, true);
        return {
          data: { userObject },
          message: CONSTANT_RESPONSE.JWT_TOEKN,
        };
      }

      //if user is not found and password && Email  is not null,which means simple SignUP with email
      else if (createUserDto.password) {
        if (createUserDto.email) {
          const hashedPassword = hashPassword(createUserDto.password);
          const userToSave = { ...createUserDto, password: hashedPassword };
          const { email, role, ...remain } =
            await this.usersRepo.save(userToSave);
          const otphash = await this.generateOtp(email, async (otp: any) => {
            const modifiedTemplate = welcomeEmailTemplate.replace(/\${otp}/g, otp);

            await sendEmail(email, 'Welcome', modifiedTemplate);
          });
          return {
            data: { otphash },
            message: CONSTANT_RESPONSE.SEND_OTP,
          };
        }
      }
    } catch (error) {
      return { message: error.message, status: false };
    }
    throw new NotFoundException('Something went wrong while Creating User');
  }

  async signin(loginDto: LoginDto) {
    try {
      let userFind = null;
      let isEmail = null;
      if (this.isEmail(loginDto.userCred)) {
        userFind = await this.usersRepo.findOne({
          where: { email: loginDto.userCred },
        });
        isEmail = true;
      } else {
        userFind = await this.usersRepo.findOne({
          where: { phoneNumber: loginDto.userCred },
        });
        isEmail = false;
      }
      if (!userFind) {
        throw new NotFoundException(CONSTANT_RESPONSE.NOT_EXSIST);
      }
      const verifyPass = verifyPassword(loginDto.password, userFind.password);
      if (verifyPass) {
        if (userFind.isVerified === false) {
          throw new NotFoundException(CONSTANT_RESPONSE.NOT_VARIFIED);
        }
        const userObject = this.createToken(
          { id: userFind.id, role: userFind.role },
          userFind,
          isEmail,
        );
        return {
          data: { userObject },
          message: CONSTANT_RESPONSE.LOGIN_SUCCESS,
        };
      } else {
        throw new NotFoundException('password is incorrect');
      }
    } catch (error) {
      return { message: error.message, status: false };
    }
  }

  createToken(payload: object, userObj: any, isEmail: boolean) {
    const token = this.jwtService.sign(payload);
    const user = {
      userName: userObj?.firstName + ' ' + userObj?.lastName,
      profileImage: userObj?.profileImage,
    };
    if (isEmail) {
      user['email'] = userObj.email;
    } else {
      user['phoneNumber'] = userObj.phoneNumber;
    }
    return { token, user };
  }

  async sendpasswordResetEmail(emailPhone: string) {
    let userFind,
      isEmail = null;
    if (this.isEmail(emailPhone)) {
      userFind = await this.usersRepo.findOne({
        where: { email: emailPhone, isVerified: true },
      });
      isEmail = true;
    } else {
      userFind = await this.usersRepo.findOne({
        where: { phoneNumber: emailPhone, isVerified: true },
      });
      isEmail = false;
    }
    if (userFind && isEmail) {
      const otphash = await this.generateOtp(emailPhone, async (otp: any) => {
        const modifiedTemplate = emailTemplate.replace(/\${name}/g, userFind.firstName + ' ' + userFind.lastName).replace(/\${otp}/g, otp);

        await sendEmail(emailPhone, 'Reset Your Password', modifiedTemplate);
      });
      return {
        data: { otphash },
        message: CONSTANT_RESPONSE.RESEND_EMAIL,
      };
    } else if (userFind && !isEmail) {
      const sendOtpViaTwilio = async (otp: string) => {
        await this.twilioClient.messages.create({
          body: `${otp} is your Laundary App OTP. Do not share it with anyone.`,
          to: `${emailPhone}`,
          from: twilioPhoneNumber,
        });
      };
      const otphash = await this.generateOtp(emailPhone, sendOtpViaTwilio);
      return { data: { otphash }, message: CONSTANT_RESPONSE.HASH };
    }
    return {
      message: `${CONSTANT_RESPONSE.NOT_VARIFIED} or ${CONSTANT_RESPONSE.NOT_EXSIST}`,
      status: false,
    };
  }

  async resetPassword(resetPasswordwithMailDto: ResetPasswordwithMailDto) {
    try {
      let promiseUpdatePass = null;
      const { emailPhone, password, otp, hash } = resetPasswordwithMailDto;
      if (this.isEmail(emailPhone)) {
        const hashedPassword = hashPassword(password);
        promiseUpdatePass = this.usersRepo.update(
          { email: emailPhone },
          {
            password: hashedPassword,
          },
        );
      } else {
        const hashedPassword = hashPassword(password);
        promiseUpdatePass = this.usersRepo.update(
          { phoneNumber: emailPhone },
          {
            password: hashedPassword,
          },
        );
      }
      const [hashValue, expires] = hash.split('.');
      const now = Date.now();
      if (now > parseInt(expires)) {
        return { message: CONSTANT_RESPONSE.OTP_EXPIRED, status: false };
      }
      const data = `${emailPhone}.${otp}.${expires}`;
      const newCalculateHash = crypto
        .createHmac('sha256', OTP_KEY)
        .update(data)
        .digest('hex');
      if (newCalculateHash === hashValue) {
        await promiseUpdatePass;
        return { message: CONSTANT_RESPONSE.PWD_RESET_SUCCESS };
      }
      return { message: CONSTANT_RESPONSE.INVALID_OTP, status: false };
    } catch (error) {
      return {
        status: false,
        message: CONSTANT_RESPONSE.FAILED_TO_RESET,
        data: error.message,
      };
    }
  }

  async resendEmail(email: any) {
    const userFind = await this.usersRepo.findOne({ where: { email } });
    if (userFind) {
      if (!userFind.isVerified) {
        const otphash = await this.generateOtp(email, async (otp: any) => {
          const modifiedTemplate = resendEmailTemplate.replace(/\${name}/g, userFind.firstName + ' ' + userFind.lastName).replace(/\${otp}/g, otp);
          await sendEmail(email, 'Verify Email OTP', modifiedTemplate);
        });
        return {
          data: { otphash },
          message: CONSTANT_RESPONSE.RESEND_EMAIL,
        };
      } else {
        return { message: CONSTANT_RESPONSE.ALREADY_VERIFIED, status: false };
      }
    } else {
      return { message: CONSTANT_RESPONSE.NOT_EXSIST, status: false };
    }
  }

  async sendOtp(phone: string) {
    const userFind = await this.usersRepo.findOne({
      where: { phoneNumber: phone },
    });
    const sendOtpViaTwilio = async (otp: string) => {
      await this.twilioClient.messages.create({
        body: `${otp} is your Laundary App OTP. Do not share it with anyone.`,
        to: `${phone}`,
        from: twilioPhoneNumber,
      });
    };

    if (userFind) {
      if (!userFind.isVerified) {
        const otphash = await this.generateOtp(phone, sendOtpViaTwilio);
        return { data: { otphash }, message: CONSTANT_RESPONSE.HASH };
      } else {
        return { message: CONSTANT_RESPONSE.ALREADY_VERIFIED, status: false };
      }
    } else {
      const otphash = await this.generateOtp(phone, sendOtpViaTwilio);
      return { data: { otphash }, message: CONSTANT_RESPONSE.HASH };
    }
  }

  async generateOtp(phoneEmail: string, fun: Function) {
    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    //bahir s sett
    const ttl = TTL;
    const expires = Date.now() + ttl;
    const data = `${phoneEmail}.${otp}.${expires}`;
    const hash = crypto
      .createHmac('sha256', OTP_KEY)
      .update(data)
      .digest('hex');
    const fullHash = `${hash}.${expires}`;
    const otpp = `${otp}`;

    console.log(`Your OTP is ${otp}`);
    console.log(`Hash value is ${fullHash}`);
    await fun(otpp);
    return fullHash;
  }

  async verifyAccount(
    emailPhone: string,
    otp: string,
    hash: string,
  ): Promise<any> {
    try {
      let userFind: any,
        user: any,
        promiseOfCreateAndUpdateUser: any = null;
      if (this.isEmail(emailPhone)) {
        userFind = await this.usersRepo.findOne({
          where: { email: emailPhone },
        });
        if (userFind && userFind.isVerified) {
          return { message: CONSTANT_RESPONSE.ALREADY_VERIFIED, status: false };
        }
        user = new Users();
        user.isVerified = true;
        promiseOfCreateAndUpdateUser = this.usersRepo.update(userFind.id, user);
      } else {
        userFind = await this.usersRepo.findOne({
          where: { phoneNumber: emailPhone, isVerified: true },
        });
        if (userFind) {
          return { message: CONSTANT_RESPONSE.ALREADY_VERIFIED, status: false };
        }
        user = new Users();
        user.phoneNumber = emailPhone;
        user.isVerified = true;
        promiseOfCreateAndUpdateUser = this.usersRepo.save(user);
      }
      const [hashValue, expires] = hash.split('.');
      const now = Date.now();
      if (now > parseInt(expires)) {
        return { message: CONSTANT_RESPONSE.OTP_EXPIRED, status: false };
      }
      const data = `${emailPhone}.${otp}.${expires}`;
      const newCalculateHash = crypto
        .createHmac('sha256', OTP_KEY)
        .update(data)
        .digest('hex');
      if (newCalculateHash === hashValue) {
        await promiseOfCreateAndUpdateUser;
        return { message: CONSTANT_RESPONSE.OTP_VARIFIED };
      }
      return { message: CONSTANT_RESPONSE.INVALID_OTP, status: false };
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
    const phoneNumberPattern =
      /^(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneNumberPattern.test(input.toString());
  }

  isEmail(input: any) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(input);
  }

  async updateProfileImage(
    userId: string,
    file: any,
    updateProfileImage: updateProfileImageDto,
  ) {
    const userFind = await this.usersRepo.findOne({ where: { id: userId } });
    if (!userFind) {
      throw new NotFoundException(CONSTANT_RESPONSE.NOT_EXSIST);
    }

    if (userFind.profileImage !== null && userFind.imageKey !== null) {
      await this.backblazeService.deleteFile(
        path.basename(url.parse(userFind.profileImage).pathname),
        userFind.imageKey,
      );
    }
    const uploadResult = await this.backblazeService.uploadFileFromBuffer(
      file.fileBuffer,
      file.originalName,
    );
    updateProfileImage.profileImage = uploadResult.url;
    updateProfileImage.imageKey = uploadResult.fileId;
    const { affected } = await this.usersRepo.update(
      userId,
      updateProfileImage,
    );
    if (affected === 1) {
      return { data: null, message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY };
    } else {
      await this.backblazeService.deleteFile(
        path.basename(url.parse(updateProfileImage.profileImage).pathname),
        updateProfileImage.imageKey,
      );
      return {
        data: null,
        message: CONSTANT_RESPONSE.UPDATE_REJECTION,
        status: false,
      };
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const findUser = await this.usersRepo.findOne({ where: { id: userId } });
    if (!findUser) {
      throw new NotFoundException(CONSTANT_RESPONSE.NOT_EXSIST);
    }

    if (
      (updateUserDto.email == null && updateUserDto.phoneNumber != undefined) ||
      (updateUserDto.email != undefined &&
        updateUserDto.phoneNumber == undefined)
    ) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.UPDATE_FAILED,
        status: false,
      };
    }
    if (
      (updateUserDto.email == null && updateUserDto.phoneNumber == null) ||
      (updateUserDto.email == undefined &&
        updateUserDto.phoneNumber == undefined)
    ) {
      const updatedUser = await this.usersRepo.update(userId, updateUserDto);

      if (updatedUser.affected === 1) {
      const  user= await this.getUserProfile(userId);
     
        return { data: user, message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY };
      } else {
        return {
          data: null,
          message: CONSTANT_RESPONSE.UPDATE_REJECTION,
          status: false,
        };
      }
    } else {
      if(findUser.email !== null && findUser.phoneNumber !== null)
      {
        await this.usersRepo.update(userId, {
          ...updateUserDto,
          email: undefined,
          phoneNumber: undefined,
        });

        return { message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY, status: false };
      }
      if (findUser.email !== updateUserDto.email) {
        const otphash = await this.generateOtp(
          updateUserDto.email,
          async (otp: any) => {
            await sendEmail(updateUserDto.email, 'Verify Email OTP', otp);
            await this.usersRepo.update(userId, {
              ...updateUserDto,
              email: undefined,
              phoneNumber: undefined,
            });
          },
        );
        return {
          data: { otphash },
          message: CONSTANT_RESPONSE.RESEND_EMAIL,
        };
      }
      if (findUser.phoneNumber !== updateUserDto.phoneNumber) {
        await this.usersRepo.update(userId, {
          ...updateUserDto,
          email: undefined,
          phoneNumber: undefined,
        });
        return this.sendOtp(updateUserDto.phoneNumber);
      }
    }
  }

  async verifyEmailPhone(
    userId: string,
    emailPhone: string,
    otp: string,
    hash: string,
  ): Promise<any> {
    try {
      let userFind: any,
        user: any,
        promiseOfCreateAndUpdateUser: any = null;
      if (this.isEmail(emailPhone)) {
        userFind = await this.usersRepo.findOne({
          where: { id: userId },
        });
        if (userFind && userFind.isVerified && (userFind.email !== null && userFind.phoneNumber !== null) ) {
          return { message: CONSTANT_RESPONSE.ALREADY_VERIFIED, status: false };
        }
        user = new Users();
        user.email = emailPhone;
        user.isVerified = true;
        promiseOfCreateAndUpdateUser = this.usersRepo.update(userId, user);
      } else {
        userFind = await this.usersRepo.findOne({
          where: { phoneNumber: emailPhone, isVerified: true },
        });
        if (userFind) {
          return { message: CONSTANT_RESPONSE.ALREADY_VERIFIED, status: false };
        }
        user = new Users();
        user.phoneNumber = emailPhone;
        user.isVerified = true;
        promiseOfCreateAndUpdateUser = this.usersRepo.update(userId, user);
      }
      const [hashValue, expires] = hash.split('.');
      const now = Date.now();
      if (now > parseInt(expires)) {
        return { message: CONSTANT_RESPONSE.OTP_EXPIRED, status: false };
      }
      const data = `${emailPhone}.${otp}.${expires}`;
      const newCalculateHash = crypto
        .createHmac('sha256', OTP_KEY)
        .update(data)
        .digest('hex');
      if (newCalculateHash === hashValue) {
        await promiseOfCreateAndUpdateUser;
        return {
          message:
            CONSTANT_RESPONSE.OTP_VARIFIED +
            ' ' +
            CONSTANT_RESPONSE.PROFILE_UPDATED_SUCCESSFULLY,
        };
      }
      return { message: CONSTANT_RESPONSE.INVALID_OTP, status: false };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(CONSTANT_RESPONSE.NOT_EXSIST);
    }
    if (user) {
      delete user.password;
  }
    return { data: user, message: CONSTANT_RESPONSE.GET_ALL };
  }

  async getUserList(page: number, take: number, userStatus: string) {
    const queryToGetData =  this.usersRepo.createQueryBuilder('user')
    .where('user.role = :role', { role: 'user' })


    const queryToGetCount =  this.usersRepo.createQueryBuilder('user')
    .where('user.role = :role', { role: 'user' })

    if (userStatus !== undefined) {
      queryToGetData.andWhere(`user.userStatus = '${userStatus}'`);
      queryToGetCount.andWhere(`user.userStatus = '${userStatus}'`);
    
      
  }

    const skip = (page - 1) * take;

    const [query, totalCount] = await Promise.all([
      queryToGetData.select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.userStatus',
        'user.phoneNumber',
        'user.profileImage',
        'user.displayName'
      ])

      .limit(take)
      .offset(skip)
      .orderBy('user.createdAt', 'DESC')
      .getMany(),
      queryToGetCount.getCount(),
    ]);

   
    return {
      data:paginateResponse({ query, totalCount, take, page }),
      message: CONSTANT_RESPONSE.RECORD_FOUND,
    }
    
  }
}
