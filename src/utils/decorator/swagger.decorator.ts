/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

const CreateUserApiDocs = (
  summary: string,
  type: any,
  goodResponse: any,
  badresponse: any,
) => [
  ApiOperation({ summary }),
  ...(type ? [ApiBody({ type })] : []),
  ApiResponse(goodResponse),
  ApiResponse(badresponse),
];

export const swaggerDocs = ({ summary, type, goodResponse, badresponse }) => {
  const decorators = CreateUserApiDocs(
    summary,
    type,
    goodResponse,
    badresponse,
  );
  return (target, key, descriptor) => {
    decorators.forEach((decorator) => decorator(target, key, descriptor));
    SetMetadata('apiDocs', decorators)(target, key, descriptor);
  };
};
