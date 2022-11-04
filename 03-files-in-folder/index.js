const { readdir, stat } = require('fs/promises');
const path = require('path');

const PATH = path.join(__dirname, 'secret-folder');

const formatFileName = (fileName, maxFileNameLen = 8, maxFileExtLen = 4) => {
  let name = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  let ext = path.extname(fileName).slice(1);

  while (name.length < maxFileNameLen) name += ' ';

  while (ext.length < maxFileExtLen) ext += ' ';

  return `${name} -  ${ext}`;
};

const getFilesInfo = async (filePath) => {
  try {
    let files = await readdir(filePath, { withFileTypes: true });

    files = files.filter((file) => {
      const fileType = Object.getOwnPropertySymbols(file);
      return file[fileType[0]] === 1;
    });

    console.log('\nFILENAME    EXT      SIZE');
    console.log('--------------------------');

    files.forEach(async (f) => {
      f.info = await stat(path.join(filePath, f.name));
      console.log(`${formatFileName(f.name)} -  ${f.info.size} byte`);
    });
  } catch (error) {
    console.error(error);
  }
};

getFilesInfo(PATH);
