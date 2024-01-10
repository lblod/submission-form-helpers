import { readFileSync } from "node:fs";

export function readFixtureFile(filePath) {
  return readFileSync(
    new URL(`fixtures/${filePath}`, import.meta.url),
    "utf-8"
  );
}
