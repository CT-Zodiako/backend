import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEvaluationPeriodDto } from './dto/create-evaluation-period.dto';
import { UpdateEvaluationPeriodDto } from './dto/update-evaluation-period.dto';

@Injectable()
export class EvaluationPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEvaluationPeriodDto: CreateEvaluationPeriodDto) {
    this.validateDateRange(
      createEvaluationPeriodDto.startsAt,
      createEvaluationPeriodDto.endsAt,
    );

    return this.prisma.evaluationPeriod.create({
      data: createEvaluationPeriodDto,
    });
  }

  findAll() {
    return this.prisma.evaluationPeriod.findMany();
  }

  findOne(id: string) {
    return this.prisma.evaluationPeriod.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateEvaluationPeriodDto: UpdateEvaluationPeriodDto) {
    const current = await this.prisma.evaluationPeriod.findUnique({
      where: { id },
      select: { startsAt: true, endsAt: true },
    });

    this.validateDateRange(
      updateEvaluationPeriodDto.startsAt ?? current?.startsAt,
      updateEvaluationPeriodDto.endsAt ?? current?.endsAt,
    );

    return this.prisma.evaluationPeriod.update({
      where: { id },
      data: updateEvaluationPeriodDto,
    });
  }

  remove(id: string) {
    return this.prisma.evaluationPeriod.delete({
      where: { id },
    });
  }

  private validateDateRange(
    startsAt?: string | Date | null,
    endsAt?: string | Date | null,
  ) {
    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
      throw new BadRequestException('startsAt must not be after endsAt');
    }
  }
}
