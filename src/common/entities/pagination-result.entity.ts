import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class PaginationResultDto<T> {
  @IsArray()
  readonly results: T[];

  @IsInt()
  total: number;

  @ApiProperty({ default: 100 })
  limit: number;

  @ApiProperty({ default: 0 })
  init: number;
}
