import { JwtModuleOptions } from '@nestjs/jwt';

// JWT_EXPIRES_IN is a positive integer number of seconds, also returned by login.
export function jwtOptions(): JwtModuleOptions {
  const secret = process.env.JWT_SECRET;
  const lifetime = process.env.JWT_EXPIRES_IN;
  if (!secret?.trim()) throw new Error('JWT_SECRET is required');
  if (!lifetime || !/^[1-9]\d*$/.test(lifetime) || !Number.isSafeInteger(Number(lifetime))) {
    throw new Error('JWT_EXPIRES_IN must be a positive integer in seconds');
  }
  return { secret, signOptions: { algorithm: 'HS256', expiresIn: Number(lifetime) } };
}
