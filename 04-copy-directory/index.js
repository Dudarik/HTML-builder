const path = require('path');

const { mkdir, unlink, readdir, copyFile } = require('fs/promises');

const SRC_PATH = path.join(__dirname, 'files');
const DST_PATH = path.join(__dirname, 'files-copy');

const createDir = async (dirname) => {
  try {
    await mkdir(dirname, { recursive: true });
  } catch (error) {
    console.error(error);
    return false;
  }
  return dirname;
};

const clearDir = async (dirname) => {
  try {
    const files = await readdir(dirname);

    if (files) {
      for (const file of files) {
        await unlink(path.join(dirname, file));
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
};

const copyFiles = async (srcPath, dstPath) => {
  const targetDir = await createDir(dstPath);
  console.log('# Create target folder, if not exist...');

  if (targetDir) {
    clearDir(targetDir);

    console.log('# Clear target folder...');

    const srcFiles = await readdir(srcPath);
    console.log('# Read files form source folder...');

    if (srcFiles) {
      console.log('# Copy files to destination folder...');

      for (const file of srcFiles) {
        try {
          await copyFile(path.join(srcPath, file), path.join(targetDir, file));
        } catch (error) {
          console.error(error);
        }
      }
      console.log(`# Process end! GLHF! Files copy to: ${dstPath}`);
    }
  }
};

copyFiles(SRC_PATH, DST_PATH);
