import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { scryptSync } from 'node:crypto';
import request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth HTTP contract (mocked persistence)', () => {
  let app: INestApplication;
  const user = { findUnique: jest.fn() };
  const secret = 'test-only-auth-secret';
  const jwt = new JwtService({ secret, signOptions: { algorithm: 'HS256', expiresIn: 60 } });
  const credentials = { username: 'alice', password: 'test password' };
  const salt = 'ab'.repeat(16);
  const stored = {
    id: 'c5e5c8c5-c44f-4a43-bdd8-78056694f6df', username: 'alice', role: 'EVALUATOR',
    createdAt: new Date(), updatedAt: new Date(),
    passwordHash: `scrypt$16384$8$1$${salt}$${scryptSync(credentials.password, salt, 64).toString('hex')}`,
  };
  const oldSecret = process.env.JWT_SECRET;
  const oldExpiry = process.env.JWT_EXPIRES_IN;
  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    process.env.JWT_EXPIRES_IN = '60';
    const module = await Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(PrismaService).useValue({ user }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
  beforeEach(() => { jest.resetAllMocks(); user.findUnique.mockResolvedValue(stored); });
  afterAll(async () => {
    await app?.close();
    if (oldSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = oldSecret;
    if (oldExpiry === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = oldExpiry;
  });

  it('logs in and resolves a safe current user', async () => {
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send(credentials).expect(200);
    expect(login.body).toEqual({ access_token: expect.any(String), token_type: 'Bearer', expires_in: 60 });
    expect(jwt.verify(login.body.access_token)).toEqual({ sub: stored.id, iat: expect.any(Number), exp: expect.any(Number) });
    expect(JSON.stringify(login.body)).not.toContain(stored.passwordHash);
    const me = await request(app.getHttpServer()).get('/api/v1/auth/me')
      .auth(login.body.access_token, { type: 'bearer' }).expect(200);
    expect(me.body).toEqual({ id: stored.id, username: stored.username, role: stored.role,
      createdAt: stored.createdAt.toISOString(), updatedAt: stored.updatedAt.toISOString() });
    expect(user.findUnique).toHaveBeenLastCalledWith({ where: { id: stored.id }, select: {
      id: true, username: true, role: true, createdAt: true, updatedAt: true,
    } });
  });

  it('does not distinguish wrong, unknown, or malformed credentials', async () => {
    const bodies: unknown[] = [];
    for (const row of [stored, null, { ...stored, passwordHash: 'malformed' }]) {
      user.findUnique.mockResolvedValue(row);
      const response = await request(app.getHttpServer()).post('/api/v1/auth/login')
        .send({ ...credentials, password: 'wrong password' }).expect(401);
      bodies.push(response.body);
    }
    expect(bodies[0]).toEqual(bodies[1]);
    expect(bodies[1]).toEqual(bodies[2]);
  });

  it.each([{}, { ...credentials, username: '' }, { ...credentials, username: '  ' },
    { ...credentials, username: 1 }, { ...credentials, password: null },
    { ...credentials, password: 123 }, { ...credentials, password: 'short' },
    { ...credentials, password: '        ' }])('validates login %j', async (body) => {
    await request(app.getHttpServer()).post('/api/v1/auth/login').send(body).expect(400);
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects missing, expired, tampered, wrong-algorithm and malformed-subject tokens', async () => {
    const valid = jwt.sign({ sub: stored.id });
    const tokens = [undefined, jwt.sign({ sub: stored.id }, { expiresIn: -1 }),
      valid.slice(0, valid.lastIndexOf('.') + 1) + 'invalid',
      jwt.sign({ sub: stored.id }, { algorithm: 'HS384' }),
      jwt.sign({ sub: 'not-a-uuid' }), jwt.sign({ sub: 42 }), jwt.sign({}),
      jwt.sign({ sub: stored.id }, { secret: 'wrong-secret' })];
    for (const token of tokens) {
      const req = request(app.getHttpServer()).get('/api/v1/auth/me');
      if (token) req.auth(token, { type: 'bearer' });
      await req.expect(401);
    }
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a valid token after the user is deleted', async () => {
    user.findUnique.mockResolvedValue(null);
    await request(app.getHttpServer()).get('/api/v1/auth/me')
      .auth(jwt.sign({ sub: stored.id }), { type: 'bearer' }).expect(401);
  });
});
