// Lists the files of a downloaded or copied docs/ folder, refusing anything but regular files.

import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Lists every file under dir. A symbolic link (or any other non-regular file) fails the library:
// reading through one could publish a file from outside docs/, such as the runner's git
// credentials or environment.
export async function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full, base)));
    else if (entry.isFile()) out.push(relative(base, full));
    else throw new Error(`docs/${relative(base, full)} is a symbolic link or special file; docs/ may hold only regular files`);
  }
  return out;
}
