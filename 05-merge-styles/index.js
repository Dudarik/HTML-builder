const path = require('path');

const { createReadStream, createWriteStream } = require('fs');
const { readdir, rm } = require('fs/promises');
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

const createCssBundle = async (srcPath, dstPath, bundleName) => {
  console.log(`\n# Delete file '${dstPath}/${bundleName}', if exist...`);

  await rm(path.join(dstPath, bundleName), { force: true });
  const files = await getCssFileNames(srcPath);

  console.log(`# Read target folder '${srcPath}/'`);

  console.log(
    `# We have ${files.length} files to merge: \n\n\t${files.join('\n\t')}\n`
  );

  if (files) {
    console.log(
      `# Merge files from folder '${srcPath}/' to '${dstPath}/${bundleName}'`
    );

    for (const file of files) {
      const input = createReadStream(file, UTF8);
      const output = createWriteStream(path.join(dstPath, bundleName), {
        flags: 'a',
      });

      pipeline(input, output, (err) => {
        if (err) console.error('this error', err);
      });
    }

    console.log(
      `# Process successfully end! GLHF! Files merge to: '${dstPath}/${bundleName}'\n`
    );
  }
};

createCssBundle(SRC_PATH, DST_PATH, BUNDLE_NAME);
