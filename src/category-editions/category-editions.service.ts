import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryEditionDto } from './dto/create-category-edition.dto';
import { UpdateCategoryEditionDto } from './dto/update-category-edition.dto';

@Injectable()
export class CategoryEditionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCategoryEditionDto: CreateCategoryEditionDto) {
    return this.prisma.categoryEdition.create({
      data: createCategoryEditionDto,
    });
  }

  findAll() {
    return this.prisma.categoryEdition.findMany();
  }

  findOne(id: string) {
    return this.prisma.categoryEdition.findUnique({
      where: { id },
    });
  }

  update(id: string, updateCategoryEditionDto: UpdateCategoryEditionDto) {
    return this.prisma.categoryEdition.update({
      where: { id },
      data: updateCategoryEditionDto,
    });
  }

  remove(id: string) {
    return this.prisma.categoryEdition.delete({
      where: { id },
    });
  }
}
