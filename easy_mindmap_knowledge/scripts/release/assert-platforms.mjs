import { readFileSync } from 'node:fs';
import { assertPlatforms } from './check-release.mjs';

const required = ['darwin-aarch64', 'darwin-x86_64', 'windows-x86_64', 'linux-x86_64'];
try {
  assertPlatforms(JSON.parse(readFileSync(process.argv[2], 'utf8')), required);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
