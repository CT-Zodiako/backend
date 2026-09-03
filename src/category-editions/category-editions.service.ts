import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryEditionDto } from './dto/create-category-edition.dto';
import { UpdateCategoryEditionDto } from './dto/update-category-edition.dto';
import { QueryCategoryEditionDto } from './dto/query-category-edition.dto';

@Injectable()
export class CategoryEditionsService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateCategoryEditionDto) { return this.prisma.categoryEdition.create({ data: dto }); }
  findAll(query: QueryCategoryEditionDto) {
    const where: Prisma.CategoryEditionWhereInput = {};
    if (query.categoryId !== undefined) where.categoryId = query.categoryId;
    if (query.periodId !== undefined) where.periodId = query.periodId;
    if (query.categoryId === undefined && query.periodId === undefined) return this.prisma.categoryEdition.findMany();
    return this.prisma.categoryEdition.findMany({ where });
  }
  findOne(id: string) { return this.prisma.categoryEdition.findUnique({ where: { id } }); }
  update(id: string, dto: UpdateCategoryEditionDto) { return this.prisma.categoryEdition.update({ where: { id }, data: dto }); }
  remove(id: string) { return this.prisma.categoryEdition.delete({ where: { id } }); }
}
