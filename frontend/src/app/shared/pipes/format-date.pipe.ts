import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, includeTime: boolean = false): string {
    if (!value) return '-';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
    }

    return date.toLocaleDateString('en-IN', options);
  }
}
