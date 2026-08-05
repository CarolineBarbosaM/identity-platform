import { Clock } from './clock';

export class FakeClock implements Clock {
  constructor(private currentDate: Date) {}

  now(): Date {
    return this.currentDate;
  }

  setNow(date: Date): void {
    this.currentDate = date;
  }
}