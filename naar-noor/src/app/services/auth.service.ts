import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSession, LoginResponse, MeResponse } from '../models';

const SESSION_KEY = 'nn_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/auth`;

  /** Reactive session — null when logged out */
  private readonly _session = signal<AuthSession | null>(this.loadSession());

  readonly isLoggedIn  = computed(() => this._session() !== null);
  readonly currentUser = computed(() => this._session());
  readonly userEmail   = computed(() => this._session()?.email ?? null);

  // ──────────────────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────────────────

  /** Log in with email + password. Returns true on success. */
  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${this.base}/login`, { email, password })
      .pipe(
        tap(res => {
          // Decode email from the JWT payload (base64 middle segment)
          const decoded = this.decodeJwt(res.access_token);
          const session: AuthSession = {
            accessToken: res.access_token,
            userId: decoded?.['sub'] ?? '',
            email:  decoded?.['email'] ?? email,
          };
          this.saveSession(session);
          this._session.set(session);
        }),
        map(() => true),
        catchError(() => of(false))
      );
  }

  /** Register a new account. Returns true on success. */
  register(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ userId: string }>(`${this.base}/register`, { email, password })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /** Log out — clears local session. */
  logout(): void {
    const session = this._session();
    if (session) {
      // Fire-and-forget server logout
      this.http
        .post(`${this.base}/logout`, { userId: session.userId })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.clearSession();
    this._session.set(null);
  }

  /** Send a password-reset email. */
  resetPassword(email: string): Observable<boolean> {
    return this.http
      .post(`${this.base}/reset-password`, { email })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /** Returns the stored JWT token (used by the HTTP interceptor). */
  getToken(): string | null {
    return this._session()?.accessToken ?? null;
  }

  /** Refresh current user details from the server. */
  refreshUser(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);

    return this.http
      .get<MeResponse>(`${this.base}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .pipe(
        tap(res => {
          const current = this._session();
          if (current) {
            const updated: AuthSession = { ...current, userId: res.userId, email: res.email };
            this.saveSession(updated);
            this._session.set(updated);
          }
        }),
        map(() => true),
        catchError(() => of(false))
      );
  }

  // ──────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────

  private loadSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  private saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  private decodeJwt(token: string): Record<string, string> | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
