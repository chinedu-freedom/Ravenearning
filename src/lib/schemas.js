import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(6, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  keepMeLoggedIn: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  phone: z.string().min(6, "Please enter a valid phone number"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be exactly 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters").optional(),
    phone: z.string().min(6, "Enter a valid phone number"),
    country_id: z.string().optional(),
    referred_by_code: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });