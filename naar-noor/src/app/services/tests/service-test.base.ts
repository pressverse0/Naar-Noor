import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

/**
 * Base class for Angular service tests using Jasmine and Karma
 * Provides common TestBed setup and helper methods for HTTP testing
 * 
 * Usage:
 * ```
 * class MyServiceTests extends ServiceTestBase {
 *   beforeEach(() => {
 *     super.beforeEach();
 *     this.service = TestBed.inject(MyService);
 *   });
 * }
 * ```
 */
export abstract class ServiceTestBase {
  protected httpMock!: HttpTestingController;

  /**
   * Setup common TestBed configuration for service tests
   * Includes HttpClientTestingModule for HTTP mocking
   */
  protected beforeEach(): void {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    this.httpMock = TestBed.inject(HttpTestingController);
  }

  /**
   * Verify no outstanding HTTP requests remain
   * Should be called in afterEach hooks
   */
  protected verifyNoOutstandingHttpRequests(): void {
    this.httpMock.verify();
  }

  /**
   * Helper to create a mock HTTP response
   * @param method HTTP method (GET, POST, etc.)
   * @param url URL to match
   * @param responseData Data to return
   * @param status HTTP status code (default 200)
   */
  protected expectHttpRequest(
    method: string,
    url: string,
    responseData: any = {},
    status: number = 200
  ) {
    const req = this.httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    req.flush(responseData, { status, statusText: 'OK' });
  }

  /**
   * Helper to create a mock HTTP error response
   * @param method HTTP method
   * @param url URL to match
   * @param status Error status code
   * @param message Error message
   */
  protected expectHttpError(
    method: string,
    url: string,
    status: number = 400,
    message: string = 'Error'
  ) {
    const req = this.httpMock.expectOne(url);
    expect(req.request.method).toBe(method);
    req.flush(message, { status, statusText: 'Error' });
  }

  /**
   * Generate mock menu item data for testing
   */
  protected generateMockMenuItem(overrides?: Partial<any>) {
    return {
      id: '1',
      name: 'Test Dish',
      description: 'Test Description',
      price: 12.99,
      category: 'Mains',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true,
      imageUrl: 'https://example.com/image.jpg',
      sortOrder: 1,
      ...overrides,
    };
  }

  /**
   * Generate mock reservation data for testing
   */
  protected generateMockReservation(overrides?: Partial<any>) {
    return {
      customerName: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '01234567890',
      reservationDate: '2024-12-31',
      reservationTime: '19:00',
      partySize: 4,
      specialRequests: '',
      ...overrides,
    };
  }

  /**
   * Generate mock order data for testing
   */
  protected generateMockOrder(overrides?: Partial<any>) {
    return {
      customerName: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '01234567890',
      type: 'delivery' as const,
      notes: '',
      items: [
        {
          menuItemId: '1',
          menuItemName: 'Test Dish',
          unitPrice: 12.99,
          quantity: 1,
        },
      ],
      ...overrides,
    };
  }
}
