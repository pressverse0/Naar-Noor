import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="min-h-screen pt-32 pb-20 px-6 bg-[#0a0a0a]">
      <div class="max-w-3xl mx-auto">

        <!-- Header -->
        <div class="mb-12 space-y-3">
          <span class="text-[#C65A1E] text-xs font-medium tracking-[0.2em] uppercase">Legal</span>
          <h1 class="font-['Forum'] text-4xl sm:text-5xl text-white tracking-tight">Terms of Service</h1>
          <p class="text-sm text-neutral-500 font-light">Last updated: June 2026</p>
        </div>

        <!-- Intro -->
        <p class="text-sm text-neutral-400 leading-relaxed font-light mb-10">
          Please read these Terms of Service carefully before using the Naar &amp; Noor website or making
          a reservation or order. By accessing or using our services, you agree to be bound by these terms.
          If you do not agree, please do not use our services.
        </p>

        <div class="space-y-10">

          <!-- Section 1 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:global-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">1. Use of the Website</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              You may use our website for lawful purposes only. You agree not to use this site in any way that
              could damage, disable, or impair the site or interfere with any other party's use of the site.
              You must be at least 18 years old to create an account or make a reservation.
            </p>
          </div>

          <!-- Section 2 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:calendar-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">2. Reservations</h2>
            </div>
            <ul class="text-sm text-neutral-400 font-light leading-relaxed space-y-2 pl-1">
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Reservations are subject to availability and are not confirmed until you receive a confirmation reference.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>We ask for at least 24 hours' notice for cancellations. Late cancellations may result in a cancellation fee.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>We reserve the right to release your table if you are more than 15 minutes late without prior notice.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>For groups of 8 or more, please contact us directly to arrange your booking.</span></li>
            </ul>
          </div>

          <!-- Section 3 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:bag-5-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">3. Orders &amp; Payments</h2>
            </div>
            <ul class="text-sm text-neutral-400 font-light leading-relaxed space-y-2 pl-1">
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>All prices shown on the menu are in British Pounds (£) and include applicable taxes.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Payment is processed securely. We do not store your card details on our servers.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Once an order is confirmed and preparation has begun, we are unable to accept cancellations.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>In the event of an error with your order, please contact us immediately and we will do our best to resolve it.</span></li>
            </ul>
          </div>

          <!-- Section 4 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:user-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">4. User Accounts</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activity that occurs under your account. Please notify us immediately at
              <a href="mailto:hello@naarnoor.com" class="text-[#C65A1E] hover:underline">hello&#64;naarnoor.com</a>
              if you suspect any unauthorised access to your account. We reserve the right to terminate
              accounts that violate these terms.
            </p>
          </div>

          <!-- Section 5 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:copyright-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">5. Intellectual Property</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              All content on this website — including text, images, logos, and design — is owned by or
              licensed to Naar &amp; Noor. You may not reproduce, distribute, or create derivative works
              from any content without our prior written permission.
            </p>
          </div>

          <!-- Section 6 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:danger-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">6. Limitation of Liability</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              To the fullest extent permitted by law, Naar &amp; Noor shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of our website or services. Our
              total liability in any matter arising out of or related to these terms is limited to the
              amount you paid for the specific order or reservation in question.
            </p>
          </div>

          <!-- Section 7 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:map-point-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">7. Governing Law</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              These terms are governed by and construed in accordance with the laws of the Bailiwick of
              Guernsey. Any disputes arising from these terms shall be subject to the exclusive jurisdiction
              of the courts of Guernsey.
            </p>
          </div>

          <!-- Section 8 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:refresh-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">8. Changes to These Terms</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              We reserve the right to update these Terms of Service at any time. Changes take effect
              immediately upon posting. Continued use of the website following any changes constitutes
              your acceptance of the new terms.
            </p>
          </div>

        </div>

        <!-- Contact CTA -->
        <div class="mt-12 p-6 rounded-2xl bg-[#0d0d0d] border border-[#C65A1E]/20 text-center space-y-4">
          <h3 class="font-['Forum'] text-xl text-white">Have Questions?</h3>
          <p class="text-sm text-neutral-400 font-light">
            If you have any questions about these terms, please get in touch.
          </p>
          <a routerLink="/contact"
             class="inline-block px-8 py-3 text-sm font-medium text-white bg-[#C65A1E] rounded-xl hover:bg-[#a84915] hover:shadow-[0_0_24px_rgba(198,90,30,0.4)] transition-all duration-300">
            Contact Us
          </a>
        </div>

        <!-- Back link -->
        <div class="mt-8 text-center">
          <a routerLink="/" class="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
            ← Back to Home
          </a>
        </div>

      </div>
    </div>
  `
})
export class TermsPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({
      title:        'Terms of Service',
      description:  'Read the Terms of Service for Naar & Noor. Understand the rules and conditions for using our website, making reservations, and placing orders.',
      canonicalUrl: 'https://www.naarnooor.com/terms',
      ogUrl:        'https://www.naarnooor.com/terms',
    });
  }
}
