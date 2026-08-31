import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryEditionDto } from './create-category-edition.dto';

export class UpdateCategoryEditionDto extends PartialType(CreateCategoryEditionDto) {}
