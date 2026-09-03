import { IsOptional, IsUUID } from 'class-validator';

export class QueryCategoryEditionDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  periodId?: string;
}
