import fs from "fs";

export function createFileReader(filePath, options = {}) {
  const { encoding = "utf8" } = options;

  return fs.createReadStream(filePath, {
    encoding,
  });
}
