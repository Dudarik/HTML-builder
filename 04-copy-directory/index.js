const path = require('path');

const { mkdir, readdir, copyFile, rm } = require('fs/promises');

const SRC_PATH = path.join(__dirname, 'files');
const DST_PATH = path.join(__dirname, 'files-copy');

const createDir = async (dstPath, recursive = true, force = true) => {
  try {
    await rm(dstPath, { recursive, force });
    await mkdir(dstPath);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};

const copyFiles = async (srcPath, dstPath) => {
  const files = await readdir(srcPath, {
    withFileTypes: true,
  });

  if (files) {
    for (const file of files) {
      if (file.isDirectory()) {
        await mkdir(path.join(dstPath, file.name));
        await copyFiles(
          path.join(srcPath, file.name),
          path.join(dstPath, file.name)
        );
      } else {
        await copyFile(
          path.join(srcPath, file.name),
          path.join(dstPath, file.name)
        );
      }
    }
  }
};

const run = async (srcPath, dstPath) => {
  await createDir(dstPath);
  await copyFiles(srcPath, dstPath);
};

run(SRC_PATH, DST_PATH);
