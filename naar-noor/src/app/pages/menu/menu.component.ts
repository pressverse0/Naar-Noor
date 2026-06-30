import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, MenuItem } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen pt-28 pb-16 px-6 bg-[#0a0a0a]">
      <div class="max-w-7xl mx-auto">
        <!-- Breadcrumb -->
        <nav data-cy="breadcrumb" class="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <a routerLink="/" class="hover:text-white transition-colors">Home</a>
          <span>/</span>
          <span class="text-neutral-300">Menu</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Filters Sidebar -->
          <div class="lg:col-span-1 space-y-6 p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 h-fit">
            <h2 class="font-['Forum'] text-xl text-white mb-4">Filters</h2>

            <!-- Category -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wider">Category</label>
              <select
                data-cy="category-filter"
                [(ngModel)]="activeCategory"
                (change)="applyFilters()"
                class="nn-input"
              >
                <option value="All">All</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Search -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wider">Search</label>
              <input
                type="search"
                [(ngModel)]="searchQuery"
                (input)="applyFilters()"
                placeholder="Search menu..."
                class="nn-input"
              />
            </div>

            <!-- Sort -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wider">Sort By</label>
              <select
                name="sortBy"
                [(ngModel)]="sortBy"
                (change)="applyFilters()"
                class="nn-input"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <!-- Dietary -->
            <div class="space-y-3 pt-2">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wider block">Dietary</label>
              <label class="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="vegetarian"
                  [(ngModel)]="dietary.vegetarian"
                  (change)="applyFilters()"
                />
                <span>Vegetarian</span>
              </label>
              <label class="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="vegan"
                  [(ngModel)]="dietary.vegan"
                  (change)="applyFilters()"
                />
                <span>Vegan</span>
              </label>
              <label class="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="glutenFree"
                  [(ngModel)]="dietary.glutenFree"
                  (change)="applyFilters()"
                />
                <span>Gluten-Free</span>
              </label>
            </div>

            <!-- Price Range -->
            <div class="space-y-2 pt-2">
              <label class="text-xs font-medium text-neutral-400 uppercase tracking-wider block">Price Range (£)</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  [(ngModel)]="minPrice"
                  (input)="applyFilters()"
                  placeholder="Min"
                  class="nn-input"
                />
                <input
                  type="number"
                  name="maxPrice"
                  [(ngModel)]="maxPrice"
                  (input)="applyFilters()"
                  placeholder="Max"
                  class="nn-input"
                />
              </div>
            </div>
          </div>

          <!-- Menu Items List -->
          <div class="lg:col-span-3">
            <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div *ngFor="let i of [1,2,3,4]" class="animate-pulse p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 h-48"></div>
            </div>

            <div *ngIf="!loading && filteredItems.length === 0" class="text-center py-16 text-neutral-500">
              No items found. Try adjusting your filters.
            </div>

            <div *ngIf="!loading && filteredItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                *ngFor="let item of filteredItems"
                data-cy="menu-item"
                class="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300 group"
              >
                <div>
                  <div class="flex justify-between items-start gap-4 mb-2">
                    <h3 class="font-['Forum'] text-xl text-white group-hover:text-[#C65A1E] transition-colors">
                      {{ item.name }}
                    </h3>
                    <span class="font-['Forum'] text-lg text-white font-medium shrink-0">£{{ item.price.toFixed(2) }}</span>
                  </div>
                  <p class="text-xs text-neutral-400 font-light leading-relaxed mb-4">
                    {{ item.description }}
                  </p>
                </div>

                <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div class="flex gap-2">
                    <span *ngIf="item.isVegan" class="text-[9px] tracking-wider uppercase bg-[#C65A1E]/10 text-[#C65A1E] px-2 py-0.5 rounded border border-[#C65A1E]/20">Vegan</span>
                    <span *ngIf="item.isVegetarian && !item.isVegan" class="text-[9px] tracking-wider uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Vegetarian</span>
                    <span *ngIf="item.isGlutenFree" class="text-[9px] tracking-wider uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Gluten-Free</span>
                  </div>

                  <button
                    (click)="addToCart(item)"
                    class="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-[#C65A1E] hover:bg-[#a84915] transition-colors flex items-center gap-2"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MenuPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly seo = inject(SeoService);

  allItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: string[] = [];

  activeCategory = 'All';
  searchQuery = '';
  sortBy = 'newest';
  dietary = {
    vegetarian: false,
    vegan: false,
    glutenFree: false
  };
  minPrice: number | null = null;
  maxPrice: number | null = null;

  loading = true;

  ngOnInit(): void {
    this.seo.set({ title: 'Menu' });
    this.api.getMenu().subscribe({
      next: (items) => {
        this.allItems = items;
        this.categories = [...new Set(items.map(i => i.category))];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let items = [...this.allItems];

    // Category
    if (this.activeCategory !== 'All') {
      items = items.filter(i => i.category === this.activeCategory);
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }

    // Dietary
    if (this.dietary.vegetarian) {
      items = items.filter(i => i.isVegetarian);
    }
    if (this.dietary.vegan) {
      items = items.filter(i => i.isVegan);
    }
    if (this.dietary.glutenFree) {
      items = items.filter(i => i.isGlutenFree);
    }

    // Price Range
    if (this.minPrice !== null && this.minPrice !== undefined) {
      items = items.filter(i => i.price >= this.minPrice!);
    }
    if (this.maxPrice !== null && this.maxPrice !== undefined) {
      items = items.filter(i => i.price <= this.maxPrice!);
    }

    // Sort
    if (this.sortBy === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // newest/default
      items.sort((a, b) => b.sortOrder - a.sortOrder);
    }

    this.filteredItems = items;
  }

  addToCart(item: MenuItem): void {
    this.cart.add({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      category: item.category
    });
  }
}
