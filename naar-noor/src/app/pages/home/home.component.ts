import { Component, OnInit, inject } from '@angular/core';
import { HeroComponent } from '../../sections/hero/hero.component';
import { AboutComponent } from '../../sections/about/about.component';
import { CategoryComponent } from '../../sections/category/category.component';
import { MenuComponent } from '../../sections/menu/menu.component';
import { CinematicBannerComponent } from '../../sections/cinematic-banner/cinematic-banner.component';
import { ReservationComponent } from '../../sections/reservation/reservation.component';
import { ChefsComponent } from '../../sections/chefs/chefs.component';
import { ReviewsComponent } from '../../sections/reviews/reviews.component';
import { BlogComponent } from '../../sections/blog/blog.component';
import { LocationsComponent } from '../../sections/locations/locations.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    AboutComponent,
    CategoryComponent,
    MenuComponent,
    CinematicBannerComponent,
    ReservationComponent,
    ChefsComponent,
    ReviewsComponent,
    BlogComponent,
    LocationsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setHome();
  }
}
