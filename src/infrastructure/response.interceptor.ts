import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Result<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  Result<T> | undefined
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Result<T> | undefined> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const traceId = request.headers['x-trace-id'] || 'TRACE_UNKNOWN';

    response.setHeader('x-trace-id', traceId);

    return next.handle().pipe(
      map((data) => {
        return data ? { statusCode: response.statusCode, data } : undefined;
      }),
    );
  }
}
