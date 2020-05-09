import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem('@GoMarketPlace:cart');

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExist = products.find(item => item.id === product.id);

      if (!productExist) {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIncremented = products.find(item => item.id === id);

      if (productIncremented) {
        productIncremented.quantity += 1;

        const productsFilter = products.filter(item => item.id !== id);
        productsFilter.push(productIncremented);

        setProducts(productsFilter);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productDecremented = products.find(item => item.id === id);

      if (productDecremented) {
        const productsFilter = products.filter(item => item.id !== id);

        if (productDecremented.quantity > 1) {
          productDecremented.quantity -= 1;
          productsFilter.push(productDecremented);
        }

        setProducts(productsFilter);
      }
    },
    [products],
  );

  useEffect(() => {
    async function storeProductData(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    }

    storeProductData();
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
