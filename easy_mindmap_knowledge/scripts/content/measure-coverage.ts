import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lessonBody, uncoveredServices, type QuestionLike } from './coverage';

// Prints the Amazon/AWS service names that appear in the imported questions but in no EN lesson body,
// with the number of questions that mention each one. Output only: nothing is written.
// Run with: npx tsx scripts/content/measure-coverage.ts
const root = fileURLToPath(new URL('../../', import.meta.url));
const questionsPath = join(root, 'content/questions/imported.json');
const lessonsDir = join(root, 'content/lessons');

function enLessonBodies(): string[] {
  return readdirSync(lessonsDir)
    .filter((topic) => statSync(join(lessonsDir, topic)).isDirectory())
    .flatMap((topic) =>
      readdirSync(join(lessonsDir, topic))
        .filter((file) => file.endsWith('.en.md'))
        .map((file) => lessonBody(readFileSync(join(lessonsDir, topic, file), 'utf8'))),
    );
}

const questions = JSON.parse(readFileSync(questionsPath, 'utf8')) as QuestionLike[];
const bodies = enLessonBodies();
const rows = uncoveredServices(questions, bodies);

console.log(`Checked ${questions.length} questions against ${bodies.length} EN lesson files.`);
console.log(`Amazon/AWS service names not named in any EN lesson body: ${rows.length}`);
console.log('');
console.log('questions  service');
for (const { name, count } of rows) console.log(`${String(count).padStart(9)}  ${name}`);
