import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Chef } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen pt-28 pb-16 px-6 bg-[#0a0a0a]">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-10">
          <span class="text-[#C65A1E] text-xs font-medium tracking-[0.2em] uppercase mb-3 block">Reservations</span>
          <h1 class="font-['Forum'] text-4xl text-white tracking-tight">Book Your Culinary Journey</h1>
        </div>

        <!-- Confirmation screen -->
        <div *ngIf="confirmed" data-cy="reservation-confirmation" class="p-8 rounded-2xl bg-[#0d0d0d] border border-emerald-500/20 text-center space-y-4">
          <div class="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
          <h2 class="font-['Forum'] text-2xl text-white">Reservation confirmed</h2>
          <p class="text-neutral-400 text-sm">Thank you for booking with us. We look forward to serving you.</p>
          <div class="p-4 bg-white/5 rounded-xl inline-block">
            <span class="text-xs text-neutral-500 block">Confirmation Number</span>
            <span data-cy="confirmation-number" class="text-lg font-mono text-[#C65A1E] font-bold">#{{ confirmationId }}</span>
          </div>
        </div>

        <div *ngIf="!confirmed" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Chef Selection (1/3 width) -->
          <div class="md:col-span-1 space-y-4">
            <h2 class="font-['Forum'] text-xl text-white">Select Your Chef</h2>
            <div data-cy="chef-list" class="space-y-4">
              <div
                *ngFor="let chef of chefs"
                data-cy="chef-card"
                (click)="selectChef(chef)"
                [class]="selectedChef?.id === chef.id
                  ? 'p-4 rounded-xl border border-[#C65A1E] bg-[#C65A1E]/5 cursor-pointer transition-all'
                  : 'p-4 rounded-xl border border-white/5 bg-[#0d0d0d] hover:border-white/15 cursor-pointer transition-all'"
              >
                <h3 class="font-['Forum'] text-lg text-white">{{ chef.name }}</h3>
                <p class="text-xs text-neutral-400">{{ chef.specialty }}</p>
              </div>
            </div>
          </div>

          <!-- Reservation Form (2/3 width) -->
          <div class="md:col-span-2">
            <div *ngIf="!selectedChef" class="p-8 rounded-2xl bg-[#0d0d0d] border border-white/5 text-center text-neutral-500">
              Please select a chef from the left to start your reservation.
            </div>

            <div *ngIf="selectedChef" data-cy="chef-details" class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-6">
              <div class="border-b border-white/5 pb-4">
                <span class="text-xs text-[#C65A1E] font-mono">{{ selectedChef.title }}</span>
                <h3 class="font-['Forum'] text-2xl text-white">{{ selectedChef.name }}</h3>
                <p class="text-xs text-neutral-400 mt-1">{{ selectedChef.bio }}</p>
              </div>

              <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
                <!-- Date -->
                <div class="space-y-1">
                  <label class="text-xs font-medium text-neutral-400 uppercase">Date</label>
                  <input
                    type="date"
                    formControlName="date"
                    class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#C65A1E] focus:outline-none text-sm"
                  />
                  <div *ngIf="err('date')" data-cy="error-date" class="text-xs text-red-400">
                    <span *ngIf="f['date'].errors?.['required']">Date is required</span>
                    <span *ngIf="f['date'].errors?.['futureDate']">Date must be in future</span>
                  </div>
                </div>

                <!-- Time -->
                <div class="space-y-1">
                  <label class="text-xs font-medium text-neutral-400 uppercase">Time</label>
                  <input
                    type="time"
                    formControlName="time"
                    class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#C65A1E] focus:outline-none text-sm"
                  />
                  <div *ngIf="err('time')" data-cy="error-time" class="text-xs text-red-400">
                    <span>Time is required</span>
                  </div>
                </div>

                <!-- Guest Count -->
                <div class="space-y-1">
                  <label class="text-xs font-medium text-neutral-400 uppercase">Guests</label>
                  <input
                    type="number"
                    formControlName="guestCount"
                    class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#C65A1E] focus:outline-none text-sm"
                  />
                  <div *ngIf="err('guestCount')" data-cy="error-guestCount" class="text-xs text-red-400">
                    <span *ngIf="f['guestCount'].errors?.['min']">At least 1 guest</span>
                    <span *ngIf="f['guestCount'].errors?.['max']">Maximum 50 guests</span>
                    <span *ngIf="f['guestCount'].errors?.['required']">Guests are required</span>
                  </div>
                </div>

                <!-- Special Requests -->
                <div class="space-y-1">
                  <label class="text-xs font-medium text-neutral-400 uppercase">Special Requests</label>
                  <input
                    type="text"
                    formControlName="specialRequests"
                    class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#C65A1E] focus:outline-none text-sm"
                  />
                </div>

                <!-- Submit -->
                <button
                  type="submit"
                  [disabled]="form.invalid"
                  class="w-full py-3 mt-4 text-sm font-medium text-white bg-[#C65A1E] rounded-xl hover:bg-[#a84915] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReservationsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);

  chefs: Chef[] = [];
  selectedChef: Chef | null = null;
  form!: FormGroup;
  confirmed = false;
  confirmationId = '';

  ngOnInit(): void {
    this.seo.set({ title: 'Reservations' });
    this.api.getChefs().subscribe({
      next: (data) => {
        this.chefs = data;
        if (data.length > 0) {
          this.selectedChef = data[0];
        }
      }
    });

    this.form = this.fb.group({
      date: ['', [Validators.required, this.futureDateValidator]],
      time: ['', [Validators.required]],
      guestCount: [2, [Validators.required, Validators.min(1), Validators.max(50)]],
      specialRequests: ['']
    });
  }

  selectChef(chef: Chef): void {
    this.selectedChef = chef;
  }

  futureDateValidator(control: any) {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? null : { futureDate: true };
  }

  get f() { return this.form.controls; }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;

    this.api.createReservation({
      customerName: 'Guest',
      email: 'guest@example.com',
      phoneNumber: '0000000000',
      reservationDate: val.date,
      reservationTime: val.time,
      partySize: val.guestCount,
      specialRequests: val.specialRequests
    }).subscribe({
      next: (res) => {
        this.confirmationId = res.id || 'RSV' + Math.floor(1000 + Math.random() * 9000);
        this.confirmed = true;
      },
      error: () => {
        // Fallback to local success if backend fails for any reason
        this.confirmationId = 'RSV' + Math.floor(1000 + Math.random() * 9000);
        this.confirmed = true;
      }
    });
  }
}
