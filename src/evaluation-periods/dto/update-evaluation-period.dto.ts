import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationPeriodDto } from './create-evaluation-period.dto';

export class UpdateEvaluationPeriodDto extends PartialType(
  CreateEvaluationPeriodDto,
) {}
