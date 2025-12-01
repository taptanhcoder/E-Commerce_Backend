import z from "zod";

export interface CustomJwtSessionClaims {
  metadata?: {
    role?: "user" | "admin";
  };
}

export const UserFormSchema = z.object({
  firstName: z
    .string({ message: "first name is required !" })
    .min(2, { message: "first name must be at least 2 characters !" })
    .max(50),
  lastName: z
    .string({ message: "last name is required !" })
    .min(2, { message: "last name must be at least 2 characters !" })
    .max(50),
  username: z
    .string({ message: "username is required !" })
    .min(2, { message: "username must be at least 2 characters !" })
    .max(50),
  emailAddress: z.array(z.string({ message: "email address is required !" })),
  password: z
    .string({ message: "password is required !" })
    .min(8, { message: "password must be at least 8 characters !" })
    .max(50),
});