import { Product } from './product'

export interface Order {
  id: string
  userId: string
  items: string[] // Array of product IDs
  total?: number
  status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt?: string
}

export interface OrderDetail {
  order: Order
  items: Product[] // Full product details
}

export interface OrderListResponse {
  items: Order[]
}