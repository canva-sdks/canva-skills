# Example: Canva API Client

Generic typed Canva REST API client. Does not include endpoint-specific methods — callers supply the path from the relevant Canva.dev markdown page.

```typescript
export class CanvaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CanvaApiError';
  }
}

interface CanvaErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export class CanvaClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor(
    accessToken: string,
    baseUrl = 'https://api.canva.com',
  ) {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const body = await response.json();

    if (!response.ok) {
      const err = body as CanvaErrorResponse;
      throw new CanvaApiError(
        response.status,
        err?.error?.code ?? 'unknown_error',
        err?.error?.message ?? `HTTP ${response.status}`,
      );
    }

    return body as T;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.headers(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T = void>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return this.handleResponse<T>(response);
  }
}
```
