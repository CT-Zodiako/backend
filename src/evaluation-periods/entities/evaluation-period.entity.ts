import { EvaluationPeriodNumber } from '../../../generated/prisma/enums.js';

export class EvaluationPeriodEntity {
  id!: string;
  year!: number;
  number!: EvaluationPeriodNumber;
  startsAt!: Date | null;
  endsAt!: Date | null;
  createdAt!: Date;
}
