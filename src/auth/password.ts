import { scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);

export async function verifyPassword(password: string, hash: unknown): Promise<boolean> {
  if (typeof hash !== 'string') return false;
  const match = /^scrypt\$16384\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(hash);
  if (!match) return false;
  try {
    // The legacy writer passes the hex salt as text, not decoded bytes.
    const key = (await deriveKey(password, match[1], 64)) as Buffer;
    return timingSafeEqual(key, Buffer.from(match[2], 'hex'));
  } catch {
    return false;
  }
}
