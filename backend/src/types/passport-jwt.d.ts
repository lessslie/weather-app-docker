/**
 * Definiciones de tipos para passport-jwt
 * Este archivo proporciona tipos TypeScript para el módulo passport-jwt
 */

declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface JwtPayload {
    [key: string]: unknown;
  }

  export interface VerifyCallback {
    (error: Error | null, user?: unknown, info?: unknown): void;
  }

  export type JwtFromRequestFunction = (
    request: Record<string, unknown>,
  ) => string | null;

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey: string;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: Record<string, unknown>;
  }

  export interface StrategyOptionsWithRequest extends StrategyOptions {
    passReqToCallback: true;
  }

  export interface StrategyOptionsWithoutRequest extends StrategyOptions {
    passReqToCallback?: false;
  }

  export type VerifyCallbackWithRequest = (
    request: Record<string, unknown>,
    payload: JwtPayload,
    done: VerifyCallback,
  ) => void;

  export type VerifyCallbackWithoutRequest = (
    payload: JwtPayload,
    done: VerifyCallback,
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptionsWithRequest,
      verify: VerifyCallbackWithRequest,
    );
    constructor(
      options: StrategyOptionsWithoutRequest,
      verify: VerifyCallbackWithoutRequest,
    );
    constructor(
      options: StrategyOptions,
      verify: VerifyCallbackWithRequest | VerifyCallbackWithoutRequest,
    );
  }

  export class ExtractJwt {
    static fromHeader(header: string): JwtFromRequestFunction;
    static fromBodyField(field: string): JwtFromRequestFunction;
    static fromUrlQueryParameter(param: string): JwtFromRequestFunction;
    static fromAuthHeaderWithScheme(authScheme: string): JwtFromRequestFunction;
    static fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    static fromExtractors(
      extractors: JwtFromRequestFunction[],
    ): JwtFromRequestFunction;
  }
}

/**
 * Definiciones de tipos para passport-jwt/lib/extract_jwt
 */
declare module 'passport-jwt/lib/extract_jwt' {
  import { JwtFromRequestFunction } from 'passport-jwt';

  export function fromHeader(header: string): JwtFromRequestFunction;
  export function fromBodyField(field: string): JwtFromRequestFunction;
  export function fromUrlQueryParameter(param: string): JwtFromRequestFunction;
  export function fromAuthHeaderWithScheme(
    authScheme: string,
  ): JwtFromRequestFunction;
  export function fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
  export function fromExtractors(
    extractors: JwtFromRequestFunction[],
  ): JwtFromRequestFunction;
}
