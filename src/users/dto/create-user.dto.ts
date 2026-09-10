import { IsEnum, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from '../../../generated/prisma/enums.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'username must not be blank' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/\S/, { message: 'password must not be blank' })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
