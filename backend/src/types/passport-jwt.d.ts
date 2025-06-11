// Tipos para passport-jwt
declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface JwtPayload {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface VerifyCallback {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: any, user?: unknown, info?: unknown): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type JwtFromRequestFunction = (request: any) => string | null;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    done: VerifyCallback,
  ) => void;

  export type VerifyCallbackWithoutRequest = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
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
    static fromAuthHeaderWithScheme(authScheme: string): JwtFromRequestFunction;
  }
}
