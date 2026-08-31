import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoryEditionsController } from './category-editions.controller';
import { CategoryEditionsService } from './category-editions.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryEditionsController],
  providers: [CategoryEditionsService],
})
export class CategoryEditionsModule {}
