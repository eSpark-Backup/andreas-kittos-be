import { randomBytes, createHash } from 'crypto';

function generateSalt(): string {
  return randomBytes(64).toString('hex');
}

function hashWithSalt(password: string, salt: string): string {
  const hash = createHash('sha256');
  hash.update(password + salt);
  return hash.digest('hex');
}

export function hashPassword(password: string): string {
  const salt = generateSalt();
  const hashedPassword = hashWithSalt(password, salt);
  return `${salt}:${hashedPassword}`;
}

export function verifyPassword(
  password: string,
  hashedPassword: string,
): boolean {
  const [salt, storedHash] = hashedPassword.split(':');
  const inputHash = hashWithSalt(password, salt);
  return inputHash === storedHash;
}
