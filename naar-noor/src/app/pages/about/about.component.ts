import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-28 pb-16 px-6 bg-[#0a0a0a]">
      <div class="max-w-3xl mx-auto text-center space-y-6">
        <h1 class="font-['Forum'] text-4xl text-white">About Naar & Noor</h1>
        <p class="text-neutral-400 text-sm leading-relaxed">
          Naar & Noor represents the collision of fire and light. A premium dining experience that takes you through centuries-old culinary traditions reimagined for the modern palate.
        </p>
      </div>
    </div>
  `
})
export class AboutPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({ title: 'About' });
  }
}
