const path = require('path');

const { createReadStream, createWriteStream, rm } = require('fs');
const { readdir } = require('fs/promises');
const { pipeline } = require('stream');

const SRC_PATH = path.join(__dirname, 'styles');
const DST_PATH = path.join(__dirname, 'project-dist');
const BUNDLE_NAME = 'bundle.css';
const UTF8 = 'utf-8';

const getCssFileNames = async (srcPath) => {
  try {
    let files = await readdir(srcPath);

    files = files.filter((file) => path.extname(file) === '.css');

    return files.map((file) => path.join(srcPath, file));
  } catch (error) {
    console.error(error);
  }
  return false;
};

const createBundle = async (srcPath, dstPath, bundleName) => {
  rm(path.join(dstPath, bundleName), { force: true });

  const files = await getCssFileNames(srcPath);

  if (files) {
    for (const file of files) {
      const input = createReadStream(file, UTF8);
      const output = createWriteStream(path.join(dstPath, bundleName), {
        flags: 'a',
      });
      pipeline(input, output, (err) => {
        if (err) console.error(err);
      });
    }
  }
};

createBundle(SRC_PATH, DST_PATH, BUNDLE_NAME);
