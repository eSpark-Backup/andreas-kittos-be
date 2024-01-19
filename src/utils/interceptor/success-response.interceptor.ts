import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { successResponse } from '../function/response';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const message = data.hasOwnProperty('message')
          ? data.message
          : 'Success';
        const modifiedResponse = successResponse({
          data: data.data,
          message: message,
        });
        data.hasOwnProperty('status')
          ? (modifiedResponse.status = data.status)
          : modifiedResponse;
        return modifiedResponse;
      }),
    );
  }
}
