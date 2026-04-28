import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindOneParams {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
