import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CategoryEditionsService } from './category-editions.service';
import { CreateCategoryEditionDto } from './dto/create-category-edition.dto';
import { UpdateCategoryEditionDto } from './dto/update-category-edition.dto';
import { QueryCategoryEditionDto } from './dto/query-category-edition.dto';

@Controller('category-editions')
export class CategoryEditionsController {
  constructor(private readonly categoryEditionsService: CategoryEditionsService) {}
  @Post() create(@Body() dto: CreateCategoryEditionDto) { return this.categoryEditionsService.create(dto); }
  @Get() findAll(@Query() query: QueryCategoryEditionDto) { return this.categoryEditionsService.findAll(query); }
  @Get(':id') findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.categoryEditionsService.findOne(id); }
  @Patch(':id') update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCategoryEditionDto) { return this.categoryEditionsService.update(id, dto); }
  @Delete(':id') remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.categoryEditionsService.remove(id); }
}
