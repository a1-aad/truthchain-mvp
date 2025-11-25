import { createHash } from 'crypto';

export function generateHash(text: string, cid: string, timestamp: string): string {
  const data = `${text}${cid}${timestamp}`;
  return createHash('sha256').update(data).digest('hex');
}
