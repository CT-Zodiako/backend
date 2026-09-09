import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryProjectDto } from './dto/query-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateProjectDto) {
    try {
      return await this.prisma.project.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new NotFoundException('Category edition not found');
      }
      throw error;
    }
  }

  findAll(query: QueryProjectDto) {
    const where: Prisma.ProjectWhereInput = {};
    if (query.name !== undefined) where.name = { contains: query.name };
    if (query.categoryEditionId !== undefined) where.categoryEditionId = query.categoryEditionId;
    if (query.name === undefined && query.categoryEditionId === undefined) return this.prisma.project.findMany();
    return this.prisma.project.findMany({ where });
  }

  findOne(id: string) { return `This action returns a #${id} project`; }
  update(id: string, _dto: UpdateProjectDto) { return `This action updates a #${id} project`; }
  remove(id: string) { return `This action removes a #${id} project`; }
}
