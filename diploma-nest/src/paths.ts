import { mkdirSync } from 'fs';
import { resolve } from 'path';

/** Stable uploads dir at project root — not under dist/ (nest build wipes dist on restart). */
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? resolve(process.env.UPLOADS_DIR)
  : resolve(process.cwd(), 'uploads');

export function ensureUploadsDir() {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}
