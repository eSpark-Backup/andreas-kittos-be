/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  LinkEmailDto,
  LoginDto,
  ResetPasswordwithMailDto,
  SendOtpDto,
  UpdateUserDto,
  VerifyOtpDto,
  resendEmailDto,
} from './dto/user.dto';
import { swaggerDocs } from '../utils/decorator/swagger.decorator';
import { Put } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/utils/decorator/role.decorator';
import { Multer } from 'multer';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { updateProfileImageDto } from './dto/update-profileImage.dto';
import { JwtAuthGuard, RoleGuard } from 'src/utils/guard';
import { userStatusDto } from './dto/change.userStatus.dto';
import { ChangePasswordDto } from './dto/change.password.dto';
import Api from 'twilio/lib/rest/Api';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  @swaggerDocs({
    summary: 'Create a new user',
    type: CreateUserDto,
    goodResponse: { status: 201, description: 'User created successfully' },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @Post('sign-in')
  @swaggerDocs({
    summary: 'User Sign In',
    type: LoginDto,
    goodResponse: { status: 201, description: 'User Signed In successfully' },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async signIn(@Body() loginDto: LoginDto) {
    return this.userService.signin(loginDto);
  }

  @Post('admin-sign-in')
  @swaggerDocs({
    summary: 'Admin Sign In',
    type: LoginDto,
    goodResponse: { status: 201, description: 'Admin Signed In successfully' },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async adminSignIn(@Body() loginDto: LoginDto) {
    return this.userService.adminSignin(loginDto);
  }

  @Post('password-reset-opt')
  @swaggerDocs({
    summary: 'Create a new user',
    type: LinkEmailDto,
    goodResponse: {
      status: 201,
      description: 'Reset Password Link send Successfully',
    },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async resetPasswordEmail(@Body() LinkEmailDto: LinkEmailDto) {
    const sendPwEmail = await this.userService.sendpasswordResetEmail(
      LinkEmailDto.emailPhone,
    );
    return sendPwEmail;
  }

  @Put('password-reset')
  @swaggerDocs({
    summary: 'Resetting Password By Verifying Token',
    type: ResetPasswordwithMailDto,
    goodResponse: { status: 201, description: 'Password reset Successfully' },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async resetPasswordwithMail(
    @Body() resetPasswordwithMailDto: ResetPasswordwithMailDto,
  ) {
    const updatePassword = await this.userService.resetPassword(
      resetPasswordwithMailDto,
    );
    return updatePassword;
  }

  @Post('send-otp')
  @swaggerDocs({
    summary: 'Send OTP to User',
    type: SendOtpDto,
    goodResponse: { status: 201, description: 'OTP send Successfully' },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return await this.userService.sendOtp(sendOtpDto.phoneNumber);
  }

  @Post('resend-email')
  @swaggerDocs({
    summary: 'Send varification to User',
    type: resendEmailDto,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.RESEND_EMAIL },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async resendEmail(@Body() sendOtpDto: resendEmailDto) {
    const OTP = await this.userService.resendEmail(sendOtpDto.email);
    return OTP;
  }

  @Post('verify-account')
  @swaggerDocs({
    summary: 'Verify OTP to User',
    type: VerifyOtpDto,
    goodResponse: { status: 201, description: 'OTP Verified Successfully' },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async verifyAccount(@Body() verifyOtpDto: VerifyOtpDto) {
    const verificationResult = await this.userService.verifyAccount(
      verifyOtpDto.emailPhone,
      verifyOtpDto.otp,
      verifyOtpDto.hash,
    );
    return verificationResult;
  }
  @Roles('admin')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('checkToken')
  async checkToken() {
    return 'Token is valid';
  }

  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'Update Profile Image',
    type: updateProfileImageDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('update-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfileImage(
    @UserId() userId: string,
    @UploadedFile() file: Multer.File,
    @Body() updateProfileImage: updateProfileImageDto,
  ) {
    return await this.userService.updateProfileImage(
      userId,
      { fileBuffer: file?.buffer, originalName: file?.originalname },
      updateProfileImage,
    );
  }

  @swaggerDocs({
    summary: 'Update User Profile',
    type: UpdateUserDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put('update-profile')
  async updateUser(
    @UserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, updateUserDto);
  }

  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('verify-new-email-phone-for-update')
  @swaggerDocs({
    summary: 'Update Email or Phone',
    type: VerifyOtpDto,
    goodResponse: {
      status: 201,
      description: 'Email/Phone Verified Successfully',
    },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async verifyEmailPhone(
    @UserId() userId: string,
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    const verificationResult = await this.userService.verifyEmailPhone(
      userId,
      verifyOtpDto.emailPhone,
      verifyOtpDto.otp,
      verifyOtpDto.hash,
    );
    return verificationResult;
  }

  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('user-profile')
  @swaggerDocs({
    summary: 'Get User Profile',
    type: null,
    goodResponse: {
      status: 201,
      description: 'User Profile Fetched Successfully',
    },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async userProfile(@UserId() userId: string) {
    return await this.userService.getUserProfile(userId);
  }

  @Roles('admin')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'userStatus', required: false })
  @ApiQuery({ name: 'customerName', required: false })
  @Get('user-list')
  @swaggerDocs({
    summary: 'Get User List (Admin Access Only)',
    type: null,
    goodResponse: {
      status: 201,
      description: 'User List Fetched Successfully',
    },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async userList(
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('userStatus') userStatus?: string,
    @Query('customerName') customerName?: string,
  ) {
    if (isNaN(+page) || !page || !+page) page = '1';
    if (isNaN(+take) || !take || !+take) take = '10';
    return await this.userService.getUserList(
      +page,
      +take,
      userStatus,
      customerName,
    );
  }

  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete('delete-account')
  @swaggerDocs({
    summary: 'Delete User Account(For Development Use Only',
    type: null,
    goodResponse: {
      status: 201,
      description: 'User Account Deleted Successfully',
    },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async deleteUser(@UserId() userId: string) {
    return await this.userService.deleteUser(userId);
  }

  @Roles('admin')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put('change-user-status/:id')
  @swaggerDocs({
    summary: 'Change User Status',
    type: null,
    goodResponse: {
      status: 201,
      description: 'User Status Changed Successfully',
    },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async changeUserStatus(
    @Param('id') userId: string,
    @Body() userStatusDto: userStatusDto,
  ) {
    return await this.userService.changeUserStatus(userId, userStatusDto);
  }

  @Roles('user')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Put('change-password')
  @swaggerDocs({
    summary: 'Change User Password',
    type: null,
    goodResponse: {
      status: 201,
      description: 'User Password Changed Successfully',
    },
    badresponse: { status: 400, description: 'Bad Request' },
  })
  async changePassword(
    @UserId() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(userId, changePasswordDto);
  }
}
