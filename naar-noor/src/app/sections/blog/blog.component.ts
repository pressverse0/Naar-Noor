import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BLOG_POSTS_DATA } from '../../../data/blog.data';
import { RevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogComponent {
  posts = BLOG_POSTS_DATA;

  trackByIndex(_index: number): number { return _index; }
}
