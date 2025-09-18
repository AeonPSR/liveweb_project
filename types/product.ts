export interface Product {
  id: string;
  name: string; // API returns 'name' instead of 'title'
  description: string;
  imageUrl: string; // API returns 'imageUrl' instead of 'image'
  price: number;
  isAvailable?: boolean; // API returns 'isAvailable' instead of 'available'
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  products: Product[];
}

