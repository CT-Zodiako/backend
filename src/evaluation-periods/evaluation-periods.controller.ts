import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { EvaluationPeriodsService } from './evaluation-periods.service';
import { CreateEvaluationPeriodDto } from './dto/create-evaluation-period.dto';
import { UpdateEvaluationPeriodDto } from './dto/update-evaluation-period.dto';
import { QueryEvaluationPeriodDto } from './dto/query-evaluation-period.dto';

@Controller('evaluation-periods')
export class EvaluationPeriodsController {
  constructor(private readonly evaluationPeriodsService: EvaluationPeriodsService) { }
  @Post() create(@Body() dto: CreateEvaluationPeriodDto) { return this.evaluationPeriodsService.create(dto); }
  @Get() findAll(@Query() query: QueryEvaluationPeriodDto) { return this.evaluationPeriodsService.findAll(query); }
  @Get(':id') findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.evaluationPeriodsService.findOne(id); }
  @Patch(':id') update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateEvaluationPeriodDto) { return this.evaluationPeriodsService.update(id, dto); }
  @Delete(':id') remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.evaluationPeriodsService.remove(id); }
}
