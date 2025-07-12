"use client"

import { useState, useEffect } from "react"

const CART_STORAGE_KEY = "cart"

// Define a type for the unit measurement
interface UnitMeasurement {
  id: number
  name: string
  description: string
}

// Define a type for the product unit
interface ProductUnit {
  id: number
  productId: number
  unitMeasurementId: number
  unitMeasurement: UnitMeasurement
}

// Define a type for the product
interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  categoryId: number
  createdAt: string
  updatedAt: string
  productUnits: ProductUnit[]
  quantity: number
  selectedUnitId: number
  cartItemId?: string
}

// Custom hook for managing the cart
export function useCart() {
  const [cart, setCart] = useState<Product[]>([])

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        const cartWithIds = parsedCart.map((item: Product) => ({
          ...item,
          cartItemId: item.cartItemId || generateCartItemId(),
        }))
        setCart(cartWithIds)
      } catch (error) {
        console.error("Error al cargar el carrito desde localStorage:", error)
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  // Function to generate a unique ID for each cart item
  const generateCartItemId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Añadir producto al carrito - MODIFICADO para permitir duplicados
  const addToCart = (product: Product, selectedUnitId: number, allowDuplicate = false) => {
    setCart((prevCart) => {
      if (!allowDuplicate) {
        const existingItemIndex = prevCart.findIndex(
          (item) => item.id === product.id && item.selectedUnitId === selectedUnitId,
        )

        if (existingItemIndex >= 0) {
          const updatedCart = [...prevCart]
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + product.quantity,
          }
          return updatedCart
        }
      }

      const newCartItem = {
        ...product,
        quantity: product.quantity || 1,
        selectedUnitId,
        cartItemId: generateCartItemId(),
      }

      return [...prevCart, newCartItem]
    })
  }

  // Nueva función para añadir producto como duplicado
  const addToCartAsDuplicate = (product: Product, selectedUnitId: number) => {
    addToCart(product, selectedUnitId, true)
  }

  // Actualizar cantidad de un producto en el carrito
  const updateCartItemQuantity = (productId: number, selectedUnitId: number, quantity: number, cartItemId?: string) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        if (cartItemId) {
          return prevCart.filter((item) => item.cartItemId !== cartItemId)
        } else {
          return prevCart.filter((item) => !(item.id === productId && item.selectedUnitId === selectedUnitId))
        }
      }

      return prevCart.map((item) => {
        if (cartItemId) {
          return item.cartItemId === cartItemId ? { ...item, quantity } : item
        } else {
          return item.id === productId && item.selectedUnitId === selectedUnitId ? { ...item, quantity } : item
        }
      })
    })
  }

  // Eliminar un producto del carrito
  const removeFromCart = (productId: number, selectedUnitId: number, cartItemId?: string) => {
    setCart((prevCart) => {
      if (cartItemId) {
        return prevCart.filter((item) => item.cartItemId !== cartItemId)
      } else {
        return prevCart.filter((item) => !(item.id === productId && item.selectedUnitId === selectedUnitId))
      }
    })
  }

  // Limpiar todo el carrito
  const clearCart = () => {
    setCart([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  // Calcular el precio total
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Obtener el número total de items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Nueva función para obtener items agrupados
  const getGroupedItems = () => {
    const grouped = cart.reduce(
      (acc, item) => {
        const key = `${item.id}-${item.selectedUnitId}`
        if (!acc[key]) {
          acc[key] = {
            product: item,
            totalQuantity: 0,
            items: [],
          }
        }
        acc[key].totalQuantity += item.quantity
        acc[key].items.push(item)
        return acc
      },
      {} as Record<string, { product: Product; totalQuantity: number; items: Product[] }>,
    )

    return Object.values(grouped)
  }

  return {
    cart,
    setCart,
    addToCart,
    addToCartAsDuplicate,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getGroupedItems,
  }
}
