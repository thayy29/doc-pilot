import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string({ message: "Nome é obrigatório." })
    .min(2, "Nome deve ter pelo menos 2 caracteres.")
    .max(100, "Nome muito longo (máx. 100 caracteres).")
    .trim(),
  email: z
    .string({ message: "E-mail é obrigatório." })
    .email("E-mail inválido.")
    .max(255, "E-mail muito longo.")
    .toLowerCase()
    .trim(),
  password: z
    .string({ message: "Senha é obrigatória." })
    .min(8, "Senha deve ter pelo menos 8 caracteres.")
    .max(128, "Senha muito longa (máx. 128 caracteres).")
    .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula.")
    .regex(/[0-9]/, "Senha deve conter ao menos um número."),
});

export const loginSchema = z.object({
  email: z
    .string({ message: "E-mail é obrigatório." })
    .email("E-mail inválido.")
    .toLowerCase()
    .trim(),
  password: z
    .string({ message: "Senha é obrigatória." })
    .min(1, "Senha é obrigatória."),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput  = z.infer<typeof loginSchema>;
