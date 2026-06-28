import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Base class for Angular component tests using Jasmine and Karma
 * Provides common TestBed setup and DOM interaction helpers
 * 
 * Usage:
 * ```
 * class MyComponentTests extends ComponentTestBase<MyComponent> {
 *   beforeEach(() => {
 *     super.beforeEach();
 *     this.initializeComponent(MyComponent);
 *   });
 * }
 * ```
 */
export abstract class ComponentTestBase<T> {
  protected component!: T;
  protected fixture!: ComponentFixture<T>;

  /**
   * Initialize component with fixture and detect changes
   * @param componentClass Component class to test
   */
  protected initializeComponent(componentClass: any): void {
    this.fixture = TestBed.createComponent(componentClass);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  /**
   * Detect changes in component
   */
  protected detectChanges(): void {
    this.fixture.detectChanges();
  }

  /**
   * Query single element by CSS selector
   * @param selector CSS selector
   * @returns DebugElement or null
   */
  protected querySelector(selector: string): DebugElement | null {
    return this.fixture.debugElement.query(By.css(selector));
  }

  /**
   * Query all elements by CSS selector
   * @param selector CSS selector
   * @returns Array of DebugElements
   */
  protected querySelectorAll(selector: string): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css(selector));
  }

  /**
   * Get element text content
   * @param selector CSS selector
   * @returns Text content or empty string
   */
  protected getTextContent(selector: string): string {
    const element = this.querySelector(selector);
    return element ? element.nativeElement.textContent.trim() : '';
  }

  /**
   * Set input element value and trigger events
   * @param selector CSS selector for input
   * @param value New value
   */
  protected setInputValue(selector: string, value: string): void {
    const element = this.querySelector(selector)?.nativeElement as HTMLInputElement;
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('input'));
      element.dispatchEvent(new Event('change'));
      this.detectChanges();
    }
  }

  /**
   * Click an element
   * @param selector CSS selector
   */
  protected click(selector: string): void {
    const element = this.querySelector(selector)?.nativeElement;
    if (element) {
      element.click();
      this.detectChanges();
    }
  }

  /**
   * Check if element has CSS class
   * @param selector CSS selector
   * @param className Class name to check
   * @returns True if element has class
   */
  protected hasClass(selector: string, className: string): boolean {
    const element = this.querySelector(selector)?.nativeElement;
    return element ? element.classList.contains(className) : false;
  }

  /**
   * Get element attribute value
   * @param selector CSS selector
   * @param attrName Attribute name
   * @returns Attribute value or null
   */
  protected getAttribute(selector: string, attrName: string): string | null {
    const element = this.querySelector(selector)?.nativeElement;
    return element ? element.getAttribute(attrName) : null;
  }

  /**
   * Set form control value and trigger validation
   * @param selector CSS selector for form control
   * @param value New value
   */
  protected setFormValue(selector: string, value: any): void {
    const element = this.querySelector(selector)?.nativeElement;
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('input'));
      element.dispatchEvent(new Event('blur'));
      element.dispatchEvent(new Event('change'));
      this.detectChanges();
    }
  }

  /**
   * Verify element is visible
   * @param selector CSS selector
   * @returns True if element is visible
   */
  protected isVisible(selector: string): boolean {
    const element = this.querySelector(selector)?.nativeElement;
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  /**
   * Check if element is disabled
   * @param selector CSS selector
   * @returns True if element is disabled
   */
  protected isDisabled(selector: string): boolean {
    const element = this.querySelector(selector)?.nativeElement as HTMLElement & { disabled?: boolean };
    return element ? element.disabled === true : false;
  }

  /**
   * Get form validation errors for a field
   * @param fieldName Form field name
   * @returns Validation error messages or empty array
   */
  protected getValidationErrors(fieldName: string): string[] {
    const errorMessages: string[] = [];
    const errorElements = this.querySelectorAll(`[data-field="${fieldName}"] .error-message`);
    errorElements.forEach((el) => {
      errorMessages.push(el.nativeElement.textContent.trim());
    });
    return errorMessages;
  }

  /**
   * Submit form
   * @param selector CSS selector for form
   */
  protected submitForm(selector: string = 'form'): void {
    const form = this.querySelector(selector)?.nativeElement;
    if (form) {
      form.dispatchEvent(new Event('submit'));
      this.detectChanges();
    }
  }

  /**
   * Wait for async operations to complete
   * @param ms Milliseconds to wait
   */
  protected async wait(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Mock service injection helper
   */
  protected provideMockService(service: any, mockImplementation: any): void {
    TestBed.overrideProvider(service, { useValue: mockImplementation });
  }
}
