import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CATEGORIES_DATA } from '../../../data/category.data';
import { RevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryComponent {
  categories = CATEGORIES_DATA;

  trackByIndex(_index: number): number { return _index; }
}
