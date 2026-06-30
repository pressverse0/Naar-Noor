import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="min-h-screen pt-32 pb-20 px-6 bg-[#0a0a0a]">
      <div class="max-w-3xl mx-auto">

        <!-- Header -->
        <div class="mb-12 space-y-3">
          <span class="text-[#C65A1E] text-xs font-medium tracking-[0.2em] uppercase">Legal</span>
          <h1 class="font-['Forum'] text-4xl sm:text-5xl text-white tracking-tight">Privacy Policy</h1>
          <p class="text-sm text-neutral-500 font-light">Last updated: June 2026</p>
        </div>

        <!-- Intro -->
        <p class="text-sm text-neutral-400 leading-relaxed font-light mb-10">
          At Naar &amp; Noor, we take your privacy seriously. This policy explains what personal information
          we collect, how we use it, and the choices you have. By using our website or making a reservation,
          you agree to the practices described here.
        </p>

        <div class="space-y-10">

          <!-- Section 1 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:user-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">1. Information We Collect</h2>
            </div>
            <ul class="text-sm text-neutral-400 font-light leading-relaxed space-y-2 pl-1">
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span><strong class="text-neutral-300 font-medium">Account data:</strong> email address and password (hashed) when you register.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span><strong class="text-neutral-300 font-medium">Reservation data:</strong> name, party size, date, time, and any special requests you provide.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span><strong class="text-neutral-300 font-medium">Order data:</strong> items ordered, quantities, and order reference numbers.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span><strong class="text-neutral-300 font-medium">Contact form data:</strong> name, email, and message content when you contact us.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span><strong class="text-neutral-300 font-medium">Technical data:</strong> browser type, device type, and pages visited (via anonymised analytics).</span></li>
            </ul>
          </div>

          <!-- Section 2 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:shield-check-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">2. How We Use Your Information</h2>
            </div>
            <ul class="text-sm text-neutral-400 font-light leading-relaxed space-y-2 pl-1">
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>To process and manage your table reservations and food orders.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>To respond to enquiries submitted via our contact form.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>To authenticate your account and keep it secure.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>To improve our website and dining experience based on aggregate usage patterns.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>To comply with legal obligations where required.</span></li>
            </ul>
          </div>

          <!-- Section 3 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:share-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">3. Sharing Your Information</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              We do not sell or rent your personal data to third parties. We may share your information only
              with trusted service providers (such as payment processors) who assist in operating our restaurant,
              and only to the extent necessary to deliver those services. These providers are contractually
              bound to keep your data confidential.
            </p>
          </div>

          <!-- Section 4 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:lock-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">4. Data Security</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              Your data is stored on secured servers. Passwords are hashed using industry-standard algorithms
              and are never stored in plain text. We use HTTPS encryption for all data transmitted between
              your browser and our servers. While we take every reasonable precaution, no method of
              transmission over the Internet is 100% secure.
            </p>
          </div>

          <!-- Section 5 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:star-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">5. Your Rights</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed mb-3">
              Under applicable data protection law (including UK GDPR), you have the right to:
            </p>
            <ul class="text-sm text-neutral-400 font-light leading-relaxed space-y-2 pl-1">
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Access the personal data we hold about you.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Correct inaccurate or incomplete data.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Request deletion of your data (subject to legal retention obligations).</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Object to or restrict certain processing activities.</span></li>
              <li class="flex gap-2"><span class="text-[#C65A1E] mt-1">–</span><span>Lodge a complaint with the relevant supervisory authority.</span></li>
            </ul>
            <p class="text-sm text-neutral-400 font-light leading-relaxed mt-3">
              To exercise any of these rights, please contact us at
              <a href="mailto:hello@naarnoor.com" class="text-[#C65A1E] hover:underline">hello&#64;naarnoor.com</a>.
            </p>
          </div>

          <!-- Section 6 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:clock-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">6. Data Retention</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              We retain account and reservation data for as long as your account is active, or as needed
              to provide our services. If you request deletion of your account, we will remove your
              personal data within 30 days, except where retention is required by law.
            </p>
          </div>

          <!-- Section 7 -->
          <div class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#C65A1E]/10 border border-[#C65A1E]/20 flex items-center justify-center text-[#C65A1E] shrink-0">
                <iconify-icon icon="solar:refresh-bold" width="16"></iconify-icon>
              </div>
              <h2 class="font-['Forum'] text-xl text-white">7. Changes to This Policy</h2>
            </div>
            <p class="text-sm text-neutral-400 font-light leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will revise the
              "Last updated" date at the top of this page. We encourage you to review this page
              periodically to stay informed about how we protect your information.
            </p>
          </div>

        </div>

        <!-- Contact CTA -->
        <div class="mt-12 p-6 rounded-2xl bg-[#0d0d0d] border border-[#C65A1E]/20 text-center space-y-4">
          <h3 class="font-['Forum'] text-xl text-white">Questions About This Policy?</h3>
          <p class="text-sm text-neutral-400 font-light">
            We're happy to help. Reach out to us any time.
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
export class PrivacyPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({
      title:        'Privacy Policy',
      description:  'Learn how Naar & Noor collects, uses, and protects your personal information. Read our full privacy policy.',
      canonicalUrl: 'https://www.naarnooor.com/privacy',
      ogUrl:        'https://www.naarnooor.com/privacy',
    });
  }
}
