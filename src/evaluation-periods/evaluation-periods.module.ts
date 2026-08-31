import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EvaluationPeriodsController } from './evaluation-periods.controller';
import { EvaluationPeriodsService } from './evaluation-periods.service';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluationPeriodsController],
  providers: [EvaluationPeriodsService],
})
export class EvaluationPeriodsModule {}
