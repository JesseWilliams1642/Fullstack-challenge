export interface CookieConfig {
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}