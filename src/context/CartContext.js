'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load dari LocalStorage saat awal buka
  useEffect(() => {
    const savedCart = localStorage.getItem('combi_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }
  }, []);

  // Simpan ke LocalStorage setiap ada perubahan cart
  useEffect(() => {
    localStorage.setItem('combi_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id_menu === product.id_menu);
      if (existing) {
        return prev.map((item) =>
          item.id_menu === product.id_menu ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // PENTING: Inisialisasi note dengan string kosong agar tidak error
      return [...prev, { ...product, qty: 1, note: '' }];
    });
  };

  const updateCartItem = (id, type, value) => {
    setCart((prev) => prev.map((item) => {
      if (item.id_menu === id) {
        if (type === 'plus') return { ...item, qty: item.qty + 1 };
        if (type === 'minus') return { ...item, qty: Math.max(1, item.qty - 1) };
        
        // PENTING: Ini logika untuk menyimpan catatan
        if (type === 'note') return { ...item, note: value }; 
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id_menu !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('combi_cart');
  };

  const totalPrice = cart.reduce((acc, item) => acc + (Number(item.harga) * item.qty), 0);
  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, totalPrice, totalQty }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);