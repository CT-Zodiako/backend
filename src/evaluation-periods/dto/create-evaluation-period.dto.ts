import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { EvaluationPeriodNumber } from '../../../generated/prisma/enums.js';

export class CreateEvaluationPeriodDto {
  @Type(() => Number)
  @IsInt()
  year!: number;

  @IsEnum(EvaluationPeriodNumber)
  number!: EvaluationPeriodNumber;

  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @IsOptional()
  @IsDateString()
  endsAt?: string | null;
}
