import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SeoConfig } from '../models';

export type { SeoConfig };

const BASE      = 'Naar & Noor';
const SITE_URL  = 'https://www.naarnooor.com';
const DEF_DESC  = 'Authentic Himalayan cuisine with flame-grilled specialties. Reserve your table or order online.';
const DEF_IMG   = `${SITE_URL}/assets/hero/hero.webp`;
const DEF_KW    = 'Himalayan restaurant, Naar Noor, flame grilled, momos, Himalayan cuisine, Nepali food, mountain food, dine in, takeaway, delivery, Guernsey restaurant';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta         = inject(Meta);

  set(config: SeoConfig): void {
    const fullTitle = config.title === BASE ? BASE : `${config.title} | ${BASE}`;
    const desc      = config.description ?? DEF_DESC;
    const image     = config.ogImage     ?? DEF_IMG;
    const type      = config.ogType      ?? 'website';
    const url       = config.ogUrl       ?? SITE_URL;
    const keywords  = config.keywords    ?? DEF_KW;

    this.titleService.setTitle(fullTitle);

    this.meta.updateTag({ name: 'description',        content: desc });
    this.meta.updateTag({ name: 'keywords',           content: keywords });
    this.meta.updateTag({ property: 'og:title',       content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image',       content: image });
    this.meta.updateTag({ property: 'og:type',        content: type });
    this.meta.updateTag({ property: 'og:url',         content: url });
    this.meta.updateTag({ property: 'og:site_name',   content: BASE });
    this.meta.updateTag({ property: 'og:locale',      content: 'en_GB' });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: image });

    if (config.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }

    if (config.canonicalUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = config.canonicalUrl;
    }
  }

  setHome(): void {
    this.set({
      title:       'Naar & Noor — Authentic Himalayan Restaurant',
      description: 'Experience Naar & Noor — authentic Himalayan recipes, flame-grilled specialties, and modern dining in Guernsey. Reserve your table, explore our menu, or order online.',
      keywords:    'Himalayan restaurant Guernsey, Naar Noor, flame grilled food, momos, Himalayan cuisine, Nepali restaurant, mountain food, dine in Guernsey, takeaway Guernsey',
      canonicalUrl: `${SITE_URL}/`,
      ogUrl:        `${SITE_URL}/`,
      ogType:       'restaurant',
    });
  }

  setCheckout(): void {
    this.set({
      title:    'Checkout',
      description: 'Complete your Naar & Noor order. Choose collection or delivery and confirm your authentic Himalayan food order.',
      noIndex:  true,
    });
  }

  setOrderConfirmed(): void {
    this.set({
      title:    'Order Confirmed',
      description: 'Your Naar & Noor order has been received. We will confirm shortly by phone.',
      noIndex:  true,
    });
  }
}
