import { HealthResponseContract } from '@phumspace/contracts';

export class HealthResponseDto implements HealthResponseContract {
  status!: string;
  service!: string;
  timestamp!: string;
}
