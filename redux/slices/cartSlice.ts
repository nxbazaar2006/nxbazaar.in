import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  cartKey?: string;
  productVariantId?: string;
  selectedAttributes?: unknown[];
  title: string;
  salePrice: number;
  qty: number;
  imageUrl?: string;
  vendorId?: string;
};

function loadInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const cart = localStorage.getItem("cart");
    return cart ? (JSON.parse(cart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persistCart(cart: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

const initialState: CartItem[] = loadInitialCart();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Partial<CartItem> & { userId?: string }>) => {
      const {
        id,
        productVariantId,
        title,
        salePrice,
        imageUrl,
        userId: vendorId,
        selectedAttributes = [],
      } = action.payload;

      if (!id || !title || salePrice == null) return;

      const cartKey = productVariantId ? `${id}:${productVariantId}` : id;
      const existingItem = state.find((item) => (item.cartKey || item.id) === cartKey);

      if (existingItem) {
        existingItem.qty += 1;
        persistCart([...state]);
        return;
      }

      state.push({
        id,
        cartKey,
        productVariantId,
        selectedAttributes,
        title,
        salePrice,
        qty: 1,
        imageUrl,
        vendorId,
      });
      persistCart([...state]);
    },
    removeFromCart: (_state, action: PayloadAction<string>) => {
      const newState = _state.filter((item) => (item.cartKey || item.id) !== action.payload);
      persistCart(newState);
      return newState;
    },
    incrementQty: (state, action: PayloadAction<string>) => {
      const cartItem = state.find((item) => (item.cartKey || item.id) === action.payload);
      if (cartItem) {
        cartItem.qty += 1;
        persistCart([...state]);
      }
    },
    decrementQty: (state, action: PayloadAction<string>) => {
      const cartItem = state.find((item) => (item.cartKey || item.id) === action.payload);
      if (cartItem && cartItem.qty > 1) {
        cartItem.qty -= 1;
        persistCart([...state]);
      }
    },
  },
});

export const { addToCart, removeFromCart, incrementQty, decrementQty } = cartSlice.actions;
export default cartSlice.reducer;