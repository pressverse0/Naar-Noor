import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RevealDirective } from '../../directives/scroll-reveal.directive';
import { Review, ReviewView } from '../../models';


@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RevealDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  reviews: ReviewView[] = [];
  loading = true;
  error = false;

  // Pagination
  currentPage = 1;
  pageSize = 3;
  paginatedReviews: ReviewView[] = [];

  // Form
  form!: FormGroup;
  selectedRating = 0;
  submitted = false;
  successMessage = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      reviewerName: ['', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });

    this.loadReviews();
  }

  loadReviews(): void {
    this.api.getReviews().subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews.map(r => ({
          id: r.id,
          text: r.comment,
          author: r.customerName,
          initial: r.customerName.charAt(0).toUpperCase(),
          rating: r.rating,
          stars: Array.from({ length: 5 }, (_, i) => i),
          source: r.source || 'Direct',
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
        }));
        this.updatePagination();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedReviews = this.reviews.slice(start, start + this.pageSize);
  }

  setPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.reviews.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
  }

  get f() { return this.form.controls; }

  submitReview(): void {
    this.submitted = true;
    if (this.form.invalid || this.selectedRating === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const newReview: ReviewView = {
      id: 'REV' + Math.floor(1000 + Math.random() * 9000),
      text: val.comment,
      author: val.reviewerName,
      initial: val.reviewerName.charAt(0).toUpperCase(),
      rating: this.selectedRating,
      stars: Array.from({ length: 5 }, (_, i) => i),
      source: 'Direct',
      date: new Date().toLocaleDateString()
    };

    // Prepend to list
    this.reviews = [newReview, ...this.reviews];
    this.updatePagination();

    // Show success
    this.successMessage = true;
    setTimeout(() => {
      this.successMessage = false;
    }, 5000);

    // Reset form
    this.form.reset();
    this.selectedRating = 0;
    this.submitted = false;
  }

  revealDelay(i: number): number { return i * 100; }
  trackByReview(_index: number, r: ReviewView): string { return r.id; }
  trackByStar(i: number): number { return i; }
  trackByIndex(_index: number): number { return _index; }
}
