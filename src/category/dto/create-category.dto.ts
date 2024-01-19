import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ type: String })
  @IsString({ message: 'category name name must be a string' })
  @IsNotEmpty({ message: 'category name cannot be empty' })
  readonly name: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean({ message: 'status must be a Boolean' })
  @IsOptional()
  readonly status?: boolean;
}
