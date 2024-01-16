import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { swaggerDocs } from '../utils/decorator/swagger.decorator'

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
}
