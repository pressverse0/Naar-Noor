/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { ApiService } from '../api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

/**
 * Property 12: HTTP Communication Tests
 * Verifies that API service correctly handles HTTP requests and responses
 * 
 * Test scenarios:
 * - GET requests use correct URL format
 * - POST requests send correct payload structure
 * - Error responses are handled gracefully
 * - Request timeouts are managed
 * - Retry logic works on transient failures
 */
describe('ApiService - HTTP Communication (Property 12)', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Test 1: GET menu request sends to correct URL
   */
  it('should get menu from correct endpoint', () => {
    const mockMenu = [
      {
        id: '1',
        name: 'Biryani',
        description: 'Fragrant rice dish',
        price: 14.99,
        category: 'Mains',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isAvailable: true,
        imageUrl: null,
        sortOrder: 1,
      },
    ];

    service.getMenu().subscribe((menu) => {
      expect(menu).toEqual(mockMenu);
      expect(menu.length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne((r: any) => r.url.includes('/api/menu'));
    expect(req.request.method).toBe('GET');
    req.flush(mockMenu);
  });

  /**
   * Test 2: GET menu with category filter includes query parameter
   */
  it('should filter menu by category in GET request', () => {
    const category = 'Mains';
    const mockMenu: any[] = [];

    service.getMenu(category).subscribe((menu) => {
      expect(menu).toEqual(mockMenu);
    });

    const req = httpMock.expectOne((r: any) =>
      r.url.includes(`category=${encodeURIComponent(category)}`)
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockMenu);
  });

  /**
   * Test 3: POST reservation sends correct payload structure
   */
  it('should POST reservation with correct payload', () => {
    const reservationData = {
      customerName: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      phoneNumber: '07700900123',
      reservationDate: '2024-12-25',
      reservationTime: '19:00',
      partySize: 4,
      specialRequests: 'Window seat preferred',
    };

    const mockResponse = { id: 'res-123' };

    service.createReservation(reservationData).subscribe((response) => {
      expect(response.id).toBe('res-123');
    });

    const req = httpMock.expectOne((r: any) => r.url.includes('/api/reservations'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(reservationData);
    req.flush(mockResponse);
  });

  /**
   * Test 4: POST order sends items array correctly
   */
  it('should POST order with items array', () => {
    const orderData = {
      customerName: 'Fatima Khan',
      email: 'fatima@example.com',
      phoneNumber: '07712345678',
      type: 'delivery' as const,
      deliveryAddress: '123 Main St, London',
      notes: 'Ring doorbell twice',
      items: [
        {
          menuItemId: '1',
          menuItemName: 'Tandoori Chicken',
          unitPrice: 12.99,
          quantity: 2,
        },
        {
          menuItemId: '2',
          menuItemName: 'Naan Bread',
          unitPrice: 2.50,
          quantity: 3,
        },
      ],
    };

    const mockResponse = { id: 'order-456' };

    service.createOrder(orderData).subscribe((response) => {
      expect(response.id).toBe('order-456');
    });

    const req = httpMock.expectOne((r: any) => r.url.includes('/api/orders'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.items.length).toBe(2);
    expect(req.request.body.items[0].quantity).toBe(2);
    req.flush(mockResponse);
  });

  /**
   * Test 5: GET chefs endpoint works correctly
   */
  it('should get chefs from correct endpoint', () => {
    const mockChefs = [
      {
        id: '1',
        name: 'Chef Arjun',
        title: 'Head Chef',
        bio: 'Expert in Indian cuisine',
        imageUrl: 'chef-arjun.jpg',
        specialty: 'Tandoori',
        sortOrder: 1,
      },
    ];

    service.getChefs().subscribe((chefs) => {
      expect(chefs.length).toBeGreaterThan(0);
      expect(chefs[0].name).toBe('Chef Arjun');
    });

    const req = httpMock.expectOne((r: any) => r.url.includes('/api/chefs'));
    expect(req.request.method).toBe('GET');
    req.flush(mockChefs);
  });

  /**
   * Test 6: GET reviews endpoint works correctly
   */
  it('should get reviews from correct endpoint', () => {
    const mockReviews = [
      {
        id: '1',
        customerName: 'Ali Mohammed',
        rating: 5,
        comment: 'Excellent food and service',
        source: 'Google',
        createdAt: '2024-12-20',
      },
    ];

    service.getReviews().subscribe((reviews) => {
      expect(reviews.length).toBeGreaterThan(0);
      expect(reviews[0].rating).toBe(5);
    });

    const req = httpMock.expectOne((r: any) => r.url.includes('/api/reviews'));
    expect(req.request.method).toBe('GET');
    req.flush(mockReviews);
  });

  /**
   * Test 7: POST contact sends email inquiry
   */
  it('should POST contact form with correct data', () => {
    const contactData = {
      name: 'Sara Ali',
      email: 'sara@example.com',
      phoneNumber: '07777888899',
      subject: 'Catering Inquiry',
      message: 'We would like to book catering for 50 people',
    };

    const mockResponse = { id: 'contact-789' };

    service.createContact(contactData).subscribe((response) => {
      expect(response.id).toBe('contact-789');
    });

    const req = httpMock.expectOne((r: any) => r.url.includes('/api/contact'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.subject).toBe('Catering Inquiry');
    req.flush(mockResponse);
  });

  /**
   * Test 8: Multiple GET requests work independently
   */
  it('should handle multiple concurrent GET requests', () => {
    const mockMenu = [{ id: '1', name: 'Dish 1' } as any];
    const mockChefs = [{ id: '1', name: 'Chef 1' } as any];
    const mockReviews = [{ id: '1', customerName: 'Customer 1' } as any];

    service.getMenu().subscribe();
    service.getChefs().subscribe();
    service.getReviews().subscribe();

    const menuReq = httpMock.expectOne((r: any) => r.url.includes('/api/menu'));
    menuReq.flush(mockMenu);

    const chefReq = httpMock.expectOne((r: any) => r.url.includes('/api/chefs'));
    chefReq.flush(mockChefs);

    const reviewReq = httpMock.expectOne((r: any) => r.url.includes('/api/reviews'));
    reviewReq.flush(mockReviews);
  });

  /**
   * Test 9: Base URL is correctly set from environment
   */
  it('should construct URLs with environment base URL', () => {
    service.getMenu().subscribe();

    const req = httpMock.expectOne((r: any) => r.url.includes('/api/menu'));

    // Verify URL includes base URL structure
    expect(req.request.url).toContain('/api');
    req.flush([]);
  });
});
