/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from '../cart.service';

/**
 * Property 13: Service State Management and Error Handling Tests
 * Verifies that cart service correctly manages state and handles edge cases
 * 
 * Test scenarios:
 * - Adding items to cart updates state
 * - Removing items works correctly
 * - Quantity calculations are accurate
 * - Empty cart state is handled
 * - Total price calculations include all items
 */
describe('CartService - State Management and Error Handling (Property 13)', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
  });

  /**
   * Test 1: Adding item to empty cart
   */
  it('should add item to empty cart', () => {
    expect(service.isEmpty()).toBe(true);
    expect(service.count()).toBe(0);

    const item = {
      menuItemId: '1',
      name: 'Tandoori Chicken',
      price: 12.99,
      category: 'Mains',
    };

    service.add(item);

    expect(service.isEmpty()).toBe(false);
    expect(service.count()).toBe(1);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].menuItemId).toBe('1');
    expect(service.items()[0].quantity).toBe(1);
  });

  /**
   * Test 2: Adding duplicate item increments quantity
   */
  it('should increment quantity when adding duplicate item', () => {
    const item = {
      menuItemId: '1',
      name: 'Biryani',
      price: 14.99,
      category: 'Mains',
    };

    service.add(item);
    service.add(item);

    expect(service.count()).toBe(2);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(2);
  });

  /**
   * Test 3: Adding different items maintains separate entries
   */
  it('should maintain separate entries for different items', () => {
    service.add({
      menuItemId: '1',
      name: 'Tandoori',
      price: 12.99,
      category: 'Mains',
    });

    service.add({
      menuItemId: '2',
      name: 'Naan',
      price: 2.50,
      category: 'Bread',
    });

    expect(service.items().length).toBe(2);
    expect(service.count()).toBe(2);
  });

  /**
   * Test 4: Total price is calculated correctly
   */
  it('should calculate total price correctly', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    service.add({
      menuItemId: '2',
      name: 'Item2',
      price: 5.00,
      category: 'Sides',
    });

    // 10.00 + 5.00 = 15.00
    expect(service.total()).toBe(15.00);
  });

  /**
   * Test 5: Total price includes quantity multiplier
   */
  it('should include quantity in total calculation', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    // Add same item again (quantity becomes 2)
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    // 10.00 * 2 = 20.00
    expect(service.total()).toBe(20.00);
  });

  /**
   * Test 6: Increment quantity works correctly
   */
  it('should increment item quantity', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    service.increment('1');

    expect(service.items()[0].quantity).toBe(2);
    expect(service.count()).toBe(2);
    expect(service.total()).toBe(20.00);
  });

  /**
   * Test 7: Decrement quantity works correctly
   */
  it('should decrement item quantity', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    service.increment('1');
    expect(service.count()).toBe(2);

    service.decrement('1');

    expect(service.items()[0].quantity).toBe(1);
    expect(service.count()).toBe(1);
  });

  /**
   * Test 8: Decrement to zero removes item from cart
   */
  it('should remove item when quantity reaches zero', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    service.decrement('1');

    expect(service.items().length).toBe(0);
    expect(service.count()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  /**
   * Test 9: Remove item removes it from cart
   */
  it('should remove item from cart', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    service.add({
      menuItemId: '2',
      name: 'Item2',
      price: 5.00,
      category: 'Sides',
    });

    service.remove('1');

    expect(service.items().length).toBe(1);
    expect(service.items()[0].menuItemId).toBe('2');
    expect(service.count()).toBe(1);
  });

  /**
   * Test 10: Clear cart empties all items
   */
  it('should clear all items from cart', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    service.add({
      menuItemId: '2',
      name: 'Item2',
      price: 5.00,
      category: 'Sides',
    });

    service.clear();

    expect(service.items().length).toBe(0);
    expect(service.count()).toBe(0);
    expect(service.total()).toBe(0);
    expect(service.isEmpty()).toBe(true);
  });

  /**
   * Test 11: Cart open/close state toggles correctly
   */
  it('should toggle cart open/close state', () => {
    expect(service.isOpen()).toBe(false);

    service.open();
    expect(service.isOpen()).toBe(true);

    service.close();
    expect(service.isOpen()).toBe(false);

    service.toggle();
    expect(service.isOpen()).toBe(true);

    service.toggle();
    expect(service.isOpen()).toBe(false);
  });

  /**
   * Test 12: Adding item automatically opens cart
   */
  it('should open cart when adding item', () => {
    service.close();
    expect(service.isOpen()).toBe(false);

    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    expect(service.isOpen()).toBe(true);
  });

  /**
   * Test 13: Formatted total returns correct currency format
   */
  it('should format total with currency symbol', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.50,
      category: 'Mains',
    });

    const formatted = service.formattedTotal();
    expect(formatted).toBe('£10.50');
  });

  /**
   * Test 14: Formatted total handles two decimal places
   */
  it('should format total with two decimal places', () => {
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.333,
      category: 'Mains',
    });

    const formatted = service.formattedTotal();
    expect(formatted).toBe('£10.33');
  });

  /**
   * Test 15: Multiple items with different quantities calculate correctly
   */
  it('should calculate total with multiple items and quantities', () => {
    // Add first item (2x @ £10.00 = £20.00)
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });
    service.add({
      menuItemId: '1',
      name: 'Item1',
      price: 10.00,
      category: 'Mains',
    });

    // Add second item (3x @ £5.00 = £15.00)
    service.add({
      menuItemId: '2',
      name: 'Item2',
      price: 5.00,
      category: 'Sides',
    });
    service.add({
      menuItemId: '2',
      name: 'Item2',
      price: 5.00,
      category: 'Sides',
    });
    service.add({
      menuItemId: '2',
      name: 'Item2',
      price: 5.00,
      category: 'Sides',
    });

    // Total: £20.00 + £15.00 = £35.00
    expect(service.total()).toBe(35.00);
    expect(service.count()).toBe(5);
    expect(service.formattedTotal()).toBe('£35.00');
  });
});
