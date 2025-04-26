import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ValidateAuthDto {
  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsString()
  signature!: string;
}

export class ReAuthDto {
  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsNumber()
  timestamp!: number;

  @IsNotEmpty()
  @IsString()
  signature!: string;
}
