/* eslint-disable prettier/prettier */
import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LinkEmailDto, LoginDto, ResetPasswordwithMailDto, SendOtpDto, UpdateUserDto, VerifyOtpDto, resendEmailDto } from './dto/user.dto';
import { swaggerDocs } from '../utils/decorator/swagger.decorator'
import { Put } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags, SwaggerModule } from '@nestjs/swagger';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/utils/decorator/role.decorator';
import { Multer } from 'multer';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { updateProfileImageDto } from './dto/update-profileImage.dto';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';


@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('sign-up')
  @swaggerDocs({
    summary: 'Create a new user',
    type: CreateUserDto,
    goodResponse: { status: 201, description: 'User created successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @Post('sign-in')
  @swaggerDocs({
    summary: 'Create a new user',
    type: LoginDto,
    goodResponse: { status: 201, description: 'User created successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async signIn(@Body() loginDto: LoginDto) {
    return this.userService.signin(loginDto);
  }

  @Post('password-reset-opt')
  @swaggerDocs({
    summary: 'Create a new user',
    type: LinkEmailDto,
    goodResponse: { status: 201, description: 'Reset Password Link send Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async resetPasswordEmail(@Body() LinkEmailDto: LinkEmailDto) {
    const sendPwEmail = await this.userService.sendpasswordResetEmail(LinkEmailDto.emailPhone);
    return sendPwEmail
  }

  @Put('password-reset')
  @swaggerDocs({
    summary: 'Resetting Password By Verifying Token',
    type: ResetPasswordwithMailDto,
    goodResponse: { status: 201, description: 'Password reset Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async resetPasswordwithMail(@Body() resetPasswordwithMailDto: ResetPasswordwithMailDto) {
    const updatePassword = await this.userService.resetPassword(resetPasswordwithMailDto);
    return updatePassword;
  }

  @Post('send-otp')
  @swaggerDocs({
    summary: 'Send OTP to User',
    type: SendOtpDto,
    goodResponse: { status: 201, description: 'OTP send Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return await this.userService.sendOtp(sendOtpDto.phoneNumber);
  }

  @Post('resend-email')
  @swaggerDocs({
    summary: 'Send varification to User',
    type: resendEmailDto,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.RESEND_EMAIL },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async resendEmail(@Body() sendOtpDto: resendEmailDto) {
    const OTP = await this.userService.resendEmail(sendOtpDto.email);
    return OTP
  }

  @Post('verify-account')
  @swaggerDocs({
    summary: 'Verify OTP to User',
    type: VerifyOtpDto,
    goodResponse: { status: 201, description: 'OTP Verified Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async verifyAccount(@Body() verifyOtpDto: VerifyOtpDto) {

    const verificationResult = await this.userService.verifyAccount(
      verifyOtpDto.emailPhone,
      verifyOtpDto.otp,
      verifyOtpDto.hash,

    );
    return verificationResult;
  }


  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'Update Profile Image',
    type: updateProfileImageDto,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.UPDATE_REJECTION }
  })
  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('update-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfileImage(@UserId() userId: string, @UploadedFile() file: Multer.File, @Body() updateProfileImage: updateProfileImageDto) {
    return await this.userService.updateProfileImage(userId, { fileBuffer: file?.buffer, originalName: file?.originalname }, updateProfileImage);
  }

  @swaggerDocs({
    summary: 'Update User Profile',
    type: UpdateUserDto,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.UPDATE_REJECTION }
  })
  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put('update-profile')
  async updateUser(@UserId() userId: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(userId, updateUserDto);
  }


  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('verify-emailphone')
  @swaggerDocs({
    summary: 'Update Email or Phone',
    type: VerifyOtpDto,
    goodResponse: { status: 201, description: 'Email/Phone Verified Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async verifyEmailPhone(@UserId() userId: string,@Body() verifyOtpDto: VerifyOtpDto) {

    const verificationResult = await this.userService.verifyEmailPhone(
      userId,
      verifyOtpDto.emailPhone,
      verifyOtpDto.otp,
      verifyOtpDto.hash,

    );
    return verificationResult;
  }






}
