# Example: Token Store

`TokenStore` interface and in-memory implementation for local development.

The in-memory store is **not suitable for production**: tokens are lost on server restart, it is not safe for multi-process deployments, and there is no encryption at rest. In production, implement `TokenStore` against a database or encrypted cache.

```typescript
export interface StoredToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

export interface TokenStore {
  get(userId: string): Promise<StoredToken | null>;
  save(userId: string, token: StoredToken): Promise<void>;
  delete(userId: string): Promise<void>;
}

export class InMemoryTokenStore implements TokenStore {
  private readonly store = new Map<string, StoredToken>();

  async get(userId: string): Promise<StoredToken | null> {
    return this.store.get(userId) ?? null;
  }

  async save(userId: string, token: StoredToken): Promise<void> {
    // Tokens are not logged
    this.store.set(userId, token);
  }

  async delete(userId: string): Promise<void> {
    this.store.delete(userId);
  }
}

export const tokenStore: TokenStore = new InMemoryTokenStore();
```
