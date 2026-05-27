import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return typeof value === 'string' ? value.replace(/\s+/g, '') : value;
  })
  @IsOptional()
  @MinLength(4)
  name!: string;

  @ApiProperty({ example: 'Password@123' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'password must contain upppercase, lowercase, digit and symbol(!@#$%^&*)',
  })
  password?: string;

  @ApiProperty({ example: 'Password@123' })
  @IsOptional()
  @IsString()
  currentPassword?: string;
}
