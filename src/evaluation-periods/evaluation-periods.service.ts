import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEvaluationPeriodDto } from './dto/create-evaluation-period.dto';
import { UpdateEvaluationPeriodDto } from './dto/update-evaluation-period.dto';
import { QueryEvaluationPeriodDto } from './dto/query-evaluation-period.dto';

@Injectable()
export class EvaluationPeriodsService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateEvaluationPeriodDto) { this.validateDateRange(dto.startsAt, dto.endsAt); return this.prisma.evaluationPeriod.create({ data: dto }); }
  findAll(query: QueryEvaluationPeriodDto) {
    const where: Prisma.EvaluationPeriodWhereInput = {};
    if (query.year !== undefined) where.year = query.year;
    if (query.number !== undefined) where.number = query.number;
    if (query.year === undefined && query.number === undefined) return this.prisma.evaluationPeriod.findMany();
    return this.prisma.evaluationPeriod.findMany({ where });
  }
  findOne(id: string) { return this.prisma.evaluationPeriod.findUnique({ where: { id } }); }
  async update(id: string, dto: UpdateEvaluationPeriodDto) {
    const current = await this.prisma.evaluationPeriod.findUnique({ where: { id }, select: { startsAt: true, endsAt: true } });
    this.validateDateRange(dto.startsAt ?? current?.startsAt, dto.endsAt ?? current?.endsAt);
    return this.prisma.evaluationPeriod.update({ where: { id }, data: dto });
  }
  remove(id: string) { return this.prisma.evaluationPeriod.delete({ where: { id } }); }
  private validateDateRange(startsAt?: string | Date | null, endsAt?: string | Date | null) {
    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) throw new BadRequestException('startsAt must not be after endsAt');
  }
}
