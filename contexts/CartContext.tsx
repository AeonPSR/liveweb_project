'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '../types/product'

interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  getTotalQuantity: () => number
  getTotalPrice: () => number
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
const [cartItems, setCartItems] = useState<CartItem[]>([])
const [isUpdating, setIsUpdating] = useState(false)

// Load cart from localStorage on mount
useEffect(() => {
	const savedCart = localStorage.getItem('cart')
	if (savedCart) {
	setCartItems(JSON.parse(savedCart))
	}
}, [])

// Save cart to localStorage whenever it changes
useEffect(() => {
	localStorage.setItem('cart', JSON.stringify(cartItems))
}, [cartItems])

const addToCart = (product: Product) => {
	if (isUpdating) {
	console.log('Cart update in progress, skipping...');
	return;
	}
	
	setIsUpdating(true);
	console.log('Adding to cart:', product.name);
	
	setCartItems(prevItems => {
	const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id)
	
	if (existingItemIndex >= 0) {
		// Update quantity of existing item
		const updatedItems = [...prevItems]
		const existingItem = updatedItems[existingItemIndex]
		if (existingItem) {
		console.log(`Updating existing item from ${existingItem.quantity} to ${existingItem.quantity + 1}`);
		existingItem.quantity += 1
		}
		return updatedItems
	} else {
		// Add new item
		console.log('Adding new item with quantity 1');
		return [...prevItems, { product, quantity: 1 }]
	}
	})
	
	// Reset the updating flag after a brief delay
	setTimeout(() => {
	setIsUpdating(false);
	}, 100);
}

const updateQuantity = (productId: string, quantity: number) => {
	if (quantity <= 0) {
	removeFromCart(productId)
	return
	}

	setCartItems(prevItems =>
	prevItems.map(item =>
		item.product.id === productId
		? { ...item, quantity }
		: item
	)
	)
}

const removeFromCart = (productId: string) => {
	setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId))
}

const getTotalQuantity = () => {
	return cartItems.reduce((total, item) => total + item.quantity, 0)
}

const getTotalPrice = () => {
	return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
}

const clearCart = () => {
	setCartItems([])
}

return (
	<CartContext.Provider value={{
	cartItems,
	addToCart,
	updateQuantity,
	removeFromCart,
	getTotalQuantity,
	getTotalPrice,
	clearCart
	}}>
	{children}
	</CartContext.Provider>
)
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}