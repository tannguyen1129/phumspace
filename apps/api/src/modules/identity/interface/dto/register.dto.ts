import { IsEmail, IsString, Length } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 72)
  password!: string;

  @IsString()
  @Length(1, 120)
  displayName!: string;
}
