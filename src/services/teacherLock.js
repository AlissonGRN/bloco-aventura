import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
export const LOCK_KEY = 'bloco.teacher.lock.v1';
const iterations = 600000;
export async function passwordHash(password, salt) {
  return bytesToHex(await pbkdf2Async(sha256, new TextEncoder().encode(password), hexToBytes(salt), { c: iterations, dkLen: 32, asyncTick: 10 }));
}
export function readLock(storage = localStorage) {
  const raw = storage.getItem(LOCK_KEY);
  if (!raw) return null;
  let lock; try { lock = JSON.parse(raw); } catch { throw new Error('Não foi possível ler a configuração de acesso deste navegador.'); }
  if (lock.scheme !== 'pbkdf2-sha256-v1' || !/^[0-9a-f]{32}$/.test(lock.salt) || !/^[0-9a-f]{64}$/.test(lock.hash)) throw new Error('A configuração da senha está inválida.');
  return lock;
}
export async function createLock(password, storage = localStorage) {
  if (password.length < 8 || password.length > 128) throw new Error('Use uma senha entre 8 e 128 caracteres.');
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const lock = { scheme: 'pbkdf2-sha256-v1', salt, hash: await passwordHash(password, salt) };
  storage.setItem(LOCK_KEY, JSON.stringify(lock));
  return lock;
}
export async function verifyPassword(password, storage = localStorage) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const lock = readLock(storage); if (!lock) return false;
  const candidate = await passwordHash(password, lock.salt);
  let difference = 0; for (let i = 0; i < lock.hash.length; i++) difference |= lock.hash.charCodeAt(i) ^ candidate.charCodeAt(i);
  return difference === 0;
}

