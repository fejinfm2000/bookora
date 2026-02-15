import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      [style.width]="width()" 
      [style.height]="height()" 
      [style.border-radius]="radius()"
      class="animate-pulse bg-gray-200 dark:bg-gray-800"
    ></div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class SkeletonComponent {
    width = input<string>('100%');
    height = input<string>('1rem');
    radius = input<string>('4px');
}
