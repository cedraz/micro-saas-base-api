import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PaginationResultDto<T> {
  @ApiProperty()
  @IsArray()
  readonly results: T[];

  @ApiProperty()
  total: number;

  @ApiProperty({ default: 100 })
  limit: number;

  @ApiProperty({ default: 0 })
  init: number;
}
