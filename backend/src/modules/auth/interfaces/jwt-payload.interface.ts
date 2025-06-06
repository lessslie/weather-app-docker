/**
 * Interfaz para el payload del JWT
 */
export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
