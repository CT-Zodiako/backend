import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { CategoriesModule } from './categories/categories.module';
import { EvaluationPeriodsModule } from './evaluation-periods/evaluation-periods.module';
import { CategoryEditionsModule } from './category-editions/category-editions.module';

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    CategoriesModule,
    EvaluationPeriodsModule,
    CategoryEditionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
