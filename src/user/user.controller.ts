/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LinkEmailDto, LoginDto, ResetPasswordwithMailDto, SendOtpDto, SendOtpDtoEmail, VerifyOtpDto, VerifyOtpDtoEmail } from './dto/user.dto';
import { swaggerDocs } from '../utils/decorator/swagger.decorator'
import { Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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

  @Post('password-reset-email-link')
  @swaggerDocs({
    summary: 'Create a new user',
    type: LinkEmailDto,
    goodResponse: { status: 201, description: 'Reset Password Link send Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async resetPasswordEmail(@Body() LinkEmailDto: LinkEmailDto) {
    const sendPwEmail = await this.userService.sendpasswordResetEmail(LinkEmailDto.to);
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
    const updatePassword = await this.userService.resetPasswordwithMail(resetPasswordwithMailDto);
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
    const OTP = await this.userService.sendOtp(sendOtpDto.phoneNumber);
    return OTP
  }





  @Post('verify-otp')
  @swaggerDocs({
    summary: 'Verify OTP to User',
    type: VerifyOtpDto,
    goodResponse: { status: 201, description: 'OTP Verified Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {

    const verificationResult = await this.userService.verifyOtp(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.otp,
      verifyOtpDto.hash,

    );
    return verificationResult;
  }

  @Post('verify-otp-email')
  @swaggerDocs({
    summary: 'Verify OTP to User sent to Email',
    type: VerifyOtpDtoEmail,
    goodResponse: { status: 201, description: 'OTP Verified Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async verifyOtpEmail(@Body() verifyOtpDto: VerifyOtpDtoEmail) {

    const verificationResult = await this.userService.verifyOtpEmail(
      verifyOtpDto.email,
      verifyOtpDto.otp,
      verifyOtpDto.hash,

    );
    return verificationResult;
  }
}
