import { scryptSync } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { jwtOptions } from '../src/auth/auth.config';
import { verifyPassword } from '../src/auth/password';
import { UsersService } from '../src/users/users.service';

const salt = 'ab'.repeat(16);
const hash = `scrypt$16384$8$1$${salt}$${scryptSync('test password', salt, 64).toString('hex')}`;

describe('Authentication units', () => {
  it('verifies the existing textual-salt scrypt format', async () => {
    expect(await verifyPassword('test password', hash)).toBe(true);
    expect(await verifyPassword('wrong password', hash)).toBe(false);
  });

  it.each([null, '', 'private', hash + 'a', hash.replace('16384', '32768'),
    hash.replace('$8$', '$9$'), hash.replace('$1$', '$2$'),
    hash.replace(salt, 'ab'), hash.slice(0, -1), hash.slice(0, -1) + 'z'])
  ('rejects malformed hashes safely: %s', async (value) => {
    expect(await verifyPassword('test password', value)).toBe(false);
  });

  it('uses an explicit credential selection without changing public lookup', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const users = new UsersService({ user: { findUnique } } as never);
    await users.findCredentialsByUsername('alice');
    expect(findUnique).toHaveBeenCalledWith({ where: { username: 'alice' }, select: {
      id: true, passwordHash: true,
    } });
  });

  it('logs in with only id and passwordHash from persistence', async () => {
    const id = 'c5e5c8c5-c44f-4a43-bdd8-78056694f6df';
    const findCredentialsByUsername = jest.fn().mockResolvedValue({ id, passwordHash: hash });
    const jwt = new JwtService({ secret: 'test-only-secret', signOptions: { algorithm: 'HS256', expiresIn: 60 } });
    const service = new AuthService({ findCredentialsByUsername } as unknown as UsersService, jwt);
    const result = await service.login('alice', 'test password');
    expect(findCredentialsByUsername).toHaveBeenCalledWith('alice');
    expect(result).toEqual({ access_token: expect.any(String), token_type: 'Bearer', expires_in: 60 });
    expect(jwt.verify(result.access_token)).toEqual({ sub: id, iat: expect.any(Number), exp: expect.any(Number) });
  });

  it('returns indistinguishable errors for wrong and unknown credentials', async () => {
    const findCredentialsByUsername = jest.fn();
    const service = new AuthService({ findCredentialsByUsername } as unknown as UsersService, new JwtService());
    for (const user of [null, { passwordHash: hash }, { passwordHash: 'malformed' }]) {
      findCredentialsByUsername.mockResolvedValue(user);
      await expect(service.login('alice', 'wrong password')).rejects.toMatchObject({ status: 401, message: 'Invalid credentials' });
    }
  });

  describe('configuration', () => {
    const originalSecret = process.env.JWT_SECRET;
    const originalExpiry = process.env.JWT_EXPIRES_IN;
    afterEach(() => {
      if (originalSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = originalSecret;
      if (originalExpiry === undefined) delete process.env.JWT_EXPIRES_IN;
      else process.env.JWT_EXPIRES_IN = originalExpiry;
    });
    it('fails closed without a secret', () => {
      delete process.env.JWT_SECRET;
      expect(jwtOptions).toThrow('JWT_SECRET');
    });
    it.each([undefined, '', '0', '-1', '1h', '1.5', '9007199254740992'])('rejects invalid lifetime %s', (value) => {
      process.env.JWT_SECRET = 'test-only-secret';
      if (value === undefined) delete process.env.JWT_EXPIRES_IN;
      else process.env.JWT_EXPIRES_IN = value;
      expect(jwtOptions).toThrow('JWT_EXPIRES_IN');
    });
  });
});
