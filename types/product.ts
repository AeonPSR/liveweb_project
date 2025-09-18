export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  available?: boolean; // indicates if product can be added to cart
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  products: Product[];
}

