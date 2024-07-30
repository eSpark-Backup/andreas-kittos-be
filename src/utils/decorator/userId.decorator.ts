import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return undefined;
    }

    const token = authorizationHeader.replace('Bearer ', '');
    const jwtService = new JwtService();
    const decodedToken = jwtService.decode(token) as any;
    if (!decodedToken || !decodedToken.id) {
      return undefined;
    }

    const userId = decodedToken.id;
    return userId;
  },
);
