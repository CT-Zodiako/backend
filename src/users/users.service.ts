import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const deriveKey = promisify(scrypt);
const publicUserSelect = {
  id: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

// Explicit projection also protects callers if a persistence adapter returns extra fields.
function publicUser(user: PublicUser): PublicUser {
  const { id, username, role, createdAt, updatedAt } = user;
  return { id, username, role, createdAt, updatedAt };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const salt = randomBytes(16).toString('hex');
    const key = (await deriveKey(dto.password, salt, 64)) as Buffer;
    // Node scrypt defaults: N=16384, r=8, p=1. Retain parameters for future verification.
    const passwordHash = `scrypt$16384$8$1$${salt}$${key.toString('hex')}`;

    try {
      const user = await this.prisma.user.create({
        data: { username: dto.username, role: dto.role, passwordHash },
        select: publicUserSelect,
      });
      return publicUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  // Internal authentication boundary; never expose this projection via a controller.
  async findCredentialsByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: { ...publicUserSelect, passwordHash: true },
    });
  }

  async findOne(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return publicUser(user);
  }
}
