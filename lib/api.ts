import { Product } from '../types/product';

const API_BASE = 'https://node-eemi.vercel.app';

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // revalidate every minute for ISR like behavior on server components
    next: { revalidate: 60 },
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listProducts(): Promise<Product[]> {
  // API returns { items: Product[] }
  const response = await fetchJSON<{ items: Product[] }>('/api/products');
  return response.items;
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return await fetchJSON<Product>(`/api/products/${id}`);
  } catch (e) {
    return null; // caller will handle notFound
  }
}
