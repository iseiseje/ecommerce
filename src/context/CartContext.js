import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, selectedColor = null, selectedSize = null, qty = 1) => {
    setCart((prev) => {
      const itemKey = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;
      const existingIndex = prev.findIndex(
        (item) => item.cartKey === itemKey || (item.id === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          ...product,
          cartKey: itemKey,
          selectedColor: selectedColor || product.color || 'Black',
          selectedSize: selectedSize || product.size || 'M',
          quantity: qty,
        },
      ];
    });
  };

  const updateQuantity = (cartKeyOrId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          const match = item.cartKey ? item.cartKey === cartKeyOrId : item.id === cartKeyOrId;
          if (match) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (cartKeyOrId) => {
    setCart((prev) =>
      prev.filter((item) => (item.cartKey ? item.cartKey !== cartKeyOrId : item.id !== cartKeyOrId))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
