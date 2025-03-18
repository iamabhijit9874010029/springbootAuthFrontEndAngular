import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private tokenKey = 'authToken';

  isAuthenticated = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Registers a new user
   * @param user - user details (username, email, password)
   * @returns Observable containing the API response message
   */
  register(user: { username: string; email: string; password: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Logs in a user and stores the token
   * @param credentials - user login credentials (email, password)
   * @returns Observable containing the JWT token
   */
  login(credentials: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storeToken(response.token);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logs out the user and clears authentication data
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Stores the JWT token in local storage
   * @param token - JWT token
   */
  public storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.next(true);
  }

  /**
   * Retrieves the stored JWT token
   * @returns JWT token or null if not available
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Handles HTTP errors and extracts meaningful messages
   * @param error - HTTP error response
   * @returns Observable throwing an error message
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unexpected error occurred!';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
