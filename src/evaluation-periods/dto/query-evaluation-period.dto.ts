import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { EvaluationPeriodNumber } from '../../../generated/prisma/enums.js';

export class QueryEvaluationPeriodDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsEnum(EvaluationPeriodNumber)
  number?: EvaluationPeriodNumber;
}
