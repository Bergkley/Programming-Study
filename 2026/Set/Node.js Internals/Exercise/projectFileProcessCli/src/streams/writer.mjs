import fs from "fs";
import path from "path";

export function createFileWriter(filePath){
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  return fs.createWriteStream(filePath);
}