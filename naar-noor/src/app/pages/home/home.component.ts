import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { HeroComponent } from '../../sections/hero/hero.component';
import { CategoryComponent } from '../../sections/category/category.component';
import { MenuComponent } from '../../sections/menu/menu.component';
import { CinematicBannerComponent } from '../../sections/cinematic-banner/cinematic-banner.component';
import { ReviewsComponent } from '../../sections/reviews/reviews.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    CategoryComponent,
    MenuComponent,
    CinematicBannerComponent,
    ReviewsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setHome();
  }
}
