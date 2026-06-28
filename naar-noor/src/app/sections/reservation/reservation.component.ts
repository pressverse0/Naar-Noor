import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { CustomCalendarComponent } from '../../components/custom-calendar/custom-calendar.component';
import { CustomDropdownComponent } from '../../components/custom-dropdown/custom-dropdown.component';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ReservationForm } from '../../models';


@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCalendarComponent, CustomDropdownComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('successAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(10px)' }),
        animate('380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  reservation: ReservationForm = {
    fullName: '', email: '', phone: '',
    date: null, time: '18:00',
    guests: '2 People', specialRequests: ''
  };

  timeSlots = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
  guestOptions = ['1 Person', '2 People', '3 People', '4 People', '5 People', '6 People', '7 People', '8 People'];

  submitting = false;
  submitted = false;
  confirmedName = '';

  onDateSelected(date: Date): void { this.reservation.date = date; }
  onTimeSelected(time: string): void { this.reservation.time = time; }
  onGuestsSelected(guests: string): void { this.reservation.guests = guests; }

  private parsePartySize(guests: string): number {
    const match = guests.match(/\d+/);
    return match ? parseInt(match[0], 10) : 2;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onSubmit(): void {
    if (!this.reservation.fullName.trim()) {
      this.toast.warning('Please enter your full name.', 'Required field');
      return;
    }
    if (!this.reservation.email.trim()) {
      this.toast.warning('Please enter your email address.', 'Required field');
      return;
    }
    if (!this.reservation.phone.trim()) {
      this.toast.warning('Please enter your phone number.', 'Required field');
      return;
    }
    if (!this.reservation.date) {
      this.toast.warning('Please select a date for your visit.', 'Required field');
      return;
    }

    this.submitting = true;

    this.api.createReservation({
      customerName: this.reservation.fullName.trim(),
      email: this.reservation.email.trim(),
      phoneNumber: this.reservation.phone.trim(),
      reservationDate: this.formatDate(this.reservation.date),
      reservationTime: this.reservation.time,
      partySize: this.parsePartySize(this.reservation.guests),
      specialRequests: this.reservation.specialRequests?.trim() || undefined
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.confirmedName = this.reservation.fullName;
        this.toast.success(
          `Your table for ${this.reservation.guests} on ${this.reservation.date!.toDateString()} at ${this.reservation.time} is booked. We'll contact you shortly to confirm.`,
          `Booking Confirmed, ${this.reservation.fullName.split(' ')[0]}!`
        );
        this.reservation = {
          fullName: '', email: '', phone: '',
          date: null, time: '18:00',
          guests: '2 People', specialRequests: ''
        };
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 400 && err.error?.errors) {
          const messages = Object.values(err.error.errors).flat() as string[];
          this.toast.error(messages[0] || 'Please check your details and try again.', 'Booking failed');
        } else {
          this.toast.error('Unable to submit your reservation. Please call us or try again.', 'Booking failed');
        }
      }
    });
  }

  bookAnother(): void {
    this.submitted = false;
    this.confirmedName = '';
  }
}
