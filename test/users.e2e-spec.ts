import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Prisma, UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersModule } from '../src/users/users.module';

// HTTP contract tests use a mocked persistence boundary; no database is required.
describe('Users HTTP contract', () => {
  let app: INestApplication;
  const user = { create: jest.fn(), findUnique: jest.fn() };
  const dto = { username: 'evaluator', password: 'test password', role: UserRole.EVALUATOR };
  const storedUser = {
    id: 'c5e5c8c5-c44f-4a43-bdd8-78056694f6df',
    username: dto.username,
    role: dto.role,
    passwordHash: 'private',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [UsersModule] })
      .overrideProvider(PrismaService)
      .useValue({ user })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    user.create.mockResolvedValue(storedUser);
    user.findUnique.mockResolvedValue(storedUser);
  });

  afterAll(async () => { await app?.close(); });

  it.each([UserRole.EVALUATOR, UserRole.ADMINISTRATOR])('creates a %s without leaking credentials', async (role) => {
    user.create.mockResolvedValue({ ...storedUser, role });
    const response = await request(app.getHttpServer()).post('/api/v1/users')
      .send({ ...dto, role, passwordHash: 'injected' }).expect(201);
    expect(response.body).toEqual({
      id: storedUser.id, username: dto.username, role,
      createdAt: storedUser.createdAt.toISOString(), updatedAt: storedUser.updatedAt.toISOString(),
    });
    expect(user.create.mock.calls[0][0].data.passwordHash).toMatch(/^scrypt\$/);
  });

  it.each([
    {},
    { ...dto, username: '' },
    { ...dto, username: '   ' },
    { ...dto, username: 123 },
    { ...dto, password: '' },
    { ...dto, password: 'short' },
    { ...dto, password: '        ' },
    { ...dto, password: 123 },
    { ...dto, password: null },
    { ...dto, role: 'OWNER' },
    { ...dto, role: null },
  ])('rejects invalid DTO %j before persistence', async (body) => {
    await request(app.getHttpServer()).post('/api/v1/users').send(body).expect(400);
    expect(user.create).not.toHaveBeenCalled();
  });

  it('returns 409 for duplicate usernames', async () => {
    user.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002', clientVersion: '7.10.0', meta: { target: ['username'] },
    }));
    await request(app.getHttpServer()).post('/api/v1/users').send(dto).expect(409);
  });

  it('looks up a public user', async () => {
    const response = await request(app.getHttpServer()).get(`/api/v1/users/${storedUser.id}`).expect(200);
    expect(response.body.id).toBe(storedUser.id);
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('password');
  });

  it('rejects an invalid UUID before persistence', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/not-a-uuid').expect(400);
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing user', async () => {
    user.findUnique.mockResolvedValue(null);
    await request(app.getHttpServer()).get(`/api/v1/users/${storedUser.id}`).expect(404);
  });
});
