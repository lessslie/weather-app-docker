declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface StrategyOptions {
    secretOrKey?: string | Buffer;
    jwtFromRequest: (request: any) => string | null;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: any;
  }

  export interface VerifiedCallback {
    (error: any, user?: any, info?: any): void;
  }

  export interface VerifyCallback {
    (payload: any, done: VerifiedCallback): void;
  }

  export interface VerifyCallbackWithRequest {
    (req: any, payload: any, done: VerifiedCallback): void;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: VerifyCallback | VerifyCallbackWithRequest,
    );
    authenticate(req: any, options?: any): void;
  }

  export namespace ExtractJwt {
    export function fromAuthHeaderAsBearerToken(): (
      request: any,
    ) => string | null;
    export function fromAuthHeaderWithScheme(
      auth_scheme: string,
    ): (request: any) => string | null;
    export function fromHeader(
      header_name: string,
    ): (request: any) => string | null;
    export function fromBodyField(
      field_name: string,
    ): (request: any) => string | null;
    export function fromUrlQueryParameter(
      param_name: string,
    ): (request: any) => string | null;
    export function fromCookie(
      cookie_name: string,
    ): (request: any) => string | null;
    export function fromExtractor(
      extractor: (request: any) => string | null,
    ): (request: any) => string | null;
  }
}

declare module 'passport-jwt/lib/extract_jwt' {
  export function fromAuthHeaderAsBearerToken(): (
    request: any,
  ) => string | null;
  export function fromAuthHeaderWithScheme(
    auth_scheme: string,
  ): (request: any) => string | null;
  export function fromHeader(
    header_name: string,
  ): (request: any) => string | null;
  export function fromBodyField(
    field_name: string,
  ): (request: any) => string | null;
  export function fromUrlQueryParameter(
    param_name: string,
  ): (request: any) => string | null;
  export function fromCookie(
    cookie_name: string,
  ): (request: any) => string | null;
  export function fromExtractor(
    extractor: (request: any) => string | null,
  ): (request: any) => string | null;
}
