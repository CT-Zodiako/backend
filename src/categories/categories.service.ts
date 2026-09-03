import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    try { return await this.prisma.category.create({ data: dto }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Category already exists');
      throw error;
    }
  }

  findAll(query: QueryCategoryDto) {
    if (query.name === undefined) return this.prisma.category.findMany();
    return this.prisma.category.findMany({ where: { name: { contains: query.name } } });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    try { return await this.prisma.category.update({ where: { id }, data: dto }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('Category already exists');
        if (error.code === 'P2025') throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try { await this.prisma.category.delete({ where: { id } }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') throw new ConflictException('Category cannot be deleted');
        if (error.code === 'P2025') throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }
}
