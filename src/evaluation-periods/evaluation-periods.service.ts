import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEvaluationPeriodDto } from './dto/create-evaluation-period.dto';
import { UpdateEvaluationPeriodDto } from './dto/update-evaluation-period.dto';
import { QueryEvaluationPeriodDto } from './dto/query-evaluation-period.dto';

@Injectable()
export class EvaluationPeriodsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateEvaluationPeriodDto) {
    this.validateDateRange(dto.startsAt, dto.endsAt);
    try {
      return await this.prisma.evaluationPeriod.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Evaluation period already exists');
      }
      throw error;
    }
  }
  findAll(query: QueryEvaluationPeriodDto) {
    const where: Prisma.EvaluationPeriodWhereInput = {};
    if (query.year !== undefined) where.year = query.year;
    if (query.number !== undefined) where.number = query.number;
    if (query.year === undefined && query.number === undefined) return this.prisma.evaluationPeriod.findMany();
    return this.prisma.evaluationPeriod.findMany({ where });
  }
  async findOne(id: string) {
    const evaluationPeriod = await this.prisma.evaluationPeriod.findUnique({ where: { id } });
    if (!evaluationPeriod) throw new NotFoundException('Evaluation period not found');
    return evaluationPeriod;
  }

  async update(id: string, dto: UpdateEvaluationPeriodDto) {
    const current = await this.prisma.evaluationPeriod.findUnique({ where: { id }, select: { startsAt: true, endsAt: true } });
    if (!current) throw new NotFoundException('Evaluation period not found');
    this.validateDateRange(dto.startsAt ?? current.startsAt, dto.endsAt ?? current.endsAt);

    try {
      return await this.prisma.evaluationPeriod.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('Evaluation period already exists');
        if (error.code === 'P2025') throw new NotFoundException('Evaluation period not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.evaluationPeriod.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Evaluation period not found');
      }
      throw error;
    }
  }
  private validateDateRange(startsAt?: string | Date | null, endsAt?: string | Date | null) {
    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) throw new BadRequestException('startsAt must not be after endsAt');
  }
}
