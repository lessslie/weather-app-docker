import { Request } from 'express';

/**
 * Extiende la interfaz Request de Express para incluir el usuario autenticado
 * El usuario siempre debe tener al menos un id
 */
export interface RequestWithUser extends Request {
  user: {
    id: string;
    email?: string;
    name?: string;
    isAdmin?: boolean;
  };
}
