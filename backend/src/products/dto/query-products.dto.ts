import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, Max, Min } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return value;
};

export class QueryProductsDto {
  @ApiPropertyOptional({ enum: ['Male', 'Female'], description: 'Filter by gender' })
  @IsOptional()
  @IsIn(['Male', 'Female'])
  gender?: string;

  @ApiPropertyOptional({ example: 'jacket', description: 'Filter by a single tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ example: 'Black', description: 'Filter by base colour' })
  @IsOptional()
  @IsString()
  baseColor?: string;

  @ApiPropertyOptional({ example: 'M', description: 'Only products available in this size' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ description: 'Only products currently on sale' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  onSale?: boolean;

  @ApiPropertyOptional({ example: 'thunderbolt', description: 'Free text search on title and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['title', 'price', 'discountedPrice'], default: 'title' })
  @IsOptional()
  @IsIn(['title', 'price', 'discountedPrice'])
  sort?: 'title' | 'price' | 'discountedPrice';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ minimum: 1, maximum: 100, description: 'Limit the number of results' })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}
