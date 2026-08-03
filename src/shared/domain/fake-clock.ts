import { Clock } from './clock';

export class FakeClock implements Clock {
  constructor(private readonly currentDate: Date) {}

  now(): Date {
    return this.currentDate;
  }
}