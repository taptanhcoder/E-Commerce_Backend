import type { Product } from "@repo/product-db";
import z from "zod";

export type CartItemType = Product & {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};

export type CartItemsType = CartItemType[];

export const shippingFormSchema = z.object({
  name: z.string().min(1, "name is required!"),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "invalid email format")
    .min(1, "email is required!"),
  phone: z
    .string()
    .min(7, "phone number must be between 7 and 10 digits!")
    .max(10, "phone number must be between 7 and 10 digits!")
    .regex(/^\d+$/, "phone number must contain only numbers!"),
  address: z.string().min(1, "address is required!"),
  city: z.string().min(1, "city is required!"),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export type CartStoreStateType = {
  cart: CartItemsType;
  hasHydrated: boolean;
};

export type CartStoreActionsType = {
  addToCart: (product: CartItemType) => void;
  removeFromCart: (product: CartItemType) => void;
  clearCart: () => void;
};