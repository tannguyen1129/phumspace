import { IsIn } from "class-validator";
export class PrivacyRequestDto { @IsIn(["EXPORT","DELETE"]) requestType!:"EXPORT"|"DELETE"; }
