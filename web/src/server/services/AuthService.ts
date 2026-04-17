import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories";
import { ConflictError, UnauthorizedError, ValidationError } from "@/shared/errors";
import type { SignUpInput } from "@/shared/validation";

const BCRYPT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
}

export class AuthService {
  /**
   * Registra um novo usuário com senha em hash bcrypt.
   * Lança ConflictError se o e-mail já existir.
   */
  async signUp(input: SignUpInput): Promise<AuthUser> {
    const emailTaken = await userRepository.emailExists(input.email);
    if (emailTaken) {
      throw new ConflictError("E-mail já cadastrado.");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: passwordHash,
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  /**
   * Valida e-mail e senha. Retorna o usuário ou lança UnauthorizedError.
   * Tempo constante para evitar timing attacks.
   */
  async validateCredentials(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const user = await userRepository.findByEmail(email);

    // Compara sempre (usuário nulo ou senha nula) para tempo constante
    const hash = user?.password ?? "$2b$12$invalidhashtopreventtimingattack";
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid || !user.password) {
      throw new UnauthorizedError("E-mail ou senha incorretos.");
    }

    return { id: user.id, name: user.name, email: user.email };
  }
}

export const authService = new AuthService();
