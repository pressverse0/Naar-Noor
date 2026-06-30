import { ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(32px)' }),
        animate('600ms 100ms cubic-bezier(0.32,0.72,0,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('glitch', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.85)' }),
        animate('500ms cubic-bezier(0.32,0.72,0,1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly embers = Array(14).fill(0);
  countdown = 10;
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.title.setTitle('404 — Page Not Found | Naar & Noor');
    this.meta.updateTag({ name: 'description', content: 'The page you are looking for could not be found. Return to Naar & Noor.' });
    this.timer = setInterval(() => {
      this.countdown--;
      this.cdr.markForCheck();
      if (this.countdown <= 0) this.goHome();
    }, 1000);
  }

  trackByIndex(_index: number): number { return _index; }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  goHome(): void {
    clearInterval(this.timer);
    this.router.navigate(['/']);
  }

  goMenu(): void {
    clearInterval(this.timer);
    this.router.navigate(['/'], { fragment: 'menu' });
  }
}
