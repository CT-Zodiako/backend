import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryEditionsService } from './category-editions.service';
import { CreateCategoryEditionDto } from './dto/create-category-edition.dto';
import { UpdateCategoryEditionDto } from './dto/update-category-edition.dto';

@Controller('category-editions')
export class CategoryEditionsController {
  constructor(
    private readonly categoryEditionsService: CategoryEditionsService,
  ) {}

  @Post()
  create(@Body() createCategoryEditionDto: CreateCategoryEditionDto) {
    return this.categoryEditionsService.create(createCategoryEditionDto);
  }

  @Get()
  findAll() {
    return this.categoryEditionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoryEditionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryEditionDto: UpdateCategoryEditionDto,
  ) {
    return this.categoryEditionsService.update(id, updateCategoryEditionDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoryEditionsService.remove(id);
  }
}
