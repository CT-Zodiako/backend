import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryEditionDto } from './dto/create-category-edition.dto';
import { UpdateCategoryEditionDto } from './dto/update-category-edition.dto';
import { QueryCategoryEditionDto } from './dto/query-category-edition.dto';

@Injectable()
export class CategoryEditionsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateCategoryEditionDto) {
    try {
      return await this.prisma.categoryEdition.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('Category edition already exists');
        if (error.code === 'P2003') throw new NotFoundException('Category or evaluation period not found');
      }
      throw error;
    }
  }
  findAll(query: QueryCategoryEditionDto) {
    const where: Prisma.CategoryEditionWhereInput = {};
    if (query.categoryId !== undefined) where.categoryId = query.categoryId;
    if (query.periodId !== undefined) where.periodId = query.periodId;
    if (query.categoryId === undefined && query.periodId === undefined) return this.prisma.categoryEdition.findMany();
    return this.prisma.categoryEdition.findMany({ where });
  }
  async findOne(id: string) {
    const categoryEdition = await this.prisma.categoryEdition.findUnique({ where: { id } });
    if (!categoryEdition) throw new NotFoundException('Category edition not found');
    return categoryEdition;
  }

  async update(id: string, dto: UpdateCategoryEditionDto) {
    try {
      return await this.prisma.categoryEdition.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('Category edition already exists');
        if (error.code === 'P2025') throw new NotFoundException('Category edition not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.categoryEdition.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new NotFoundException('Category edition not found');
        if (error.code === 'P2003') throw new ConflictException('Category edition cannot be deleted');
      }
      throw error;
    }
  }
}
