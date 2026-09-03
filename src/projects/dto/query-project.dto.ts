import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryEditionId?: string;
}
