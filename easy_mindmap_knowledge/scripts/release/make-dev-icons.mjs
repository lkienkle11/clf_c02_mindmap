// Generates src-tauri/icons-dev/ from app-icon-dev.svg.
// `tauri icon` also writes android/ and ios/ folders, so it runs in an OS temp
// folder and only the desktop files are copied over.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const svg = join(root, 'app-icon-dev.svg');
const outDir = join(root, 'src-tauri', 'icons-dev');
const FILES = ['32x32.png', '128x128.png', '128x128@2x.png', 'icon.icns', 'icon.ico', 'icon.png'];

const tmp = mkdtempSync(join(tmpdir(), 'dev-icons-'));
execFileSync('npx', ['tauri', 'icon', svg, '-o', tmp], { cwd: root, stdio: 'inherit' });

mkdirSync(outDir, { recursive: true });
for (const f of FILES) copyFileSync(join(tmp, f), join(outDir, f));
console.log(`Wrote ${FILES.length} icons to ${outDir}`);
