import { IsUUID } from 'class-validator';

export class CreateCategoryEditionDto {
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  periodId!: string;
}
