/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LinkEmailDto, LoginDto, ResetPasswordwithMailDto } from './dto/user.dto';
import { swaggerDocs } from '../utils/decorator/swagger.decorator'
import { Put } from '@nestjs/common';
import { Param } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('signup')
  @swaggerDocs({
    summary: 'Create a new user',
    type: CreateUserDto,
    goodResponse: { status: 201, description: 'User created successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @Post('signin')
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

  @Put('password-reset/:token')
  @swaggerDocs({
    summary: 'Resetting Password By Verifying Token',
    type: ResetPasswordwithMailDto,
    goodResponse: { status: 201, description: 'Password reset Successfully' },
    badresponse: { status: 400, description: 'Bad Request' }
  })
  async resetPasswordwithMail(@Param('token') token: string, @Body() resetPasswordwithMailDto: ResetPasswordwithMailDto) {
    const updatePassword = await this.userService.resetPasswordwithMail(token, resetPasswordwithMailDto);
    return updatePassword;
  }
}
