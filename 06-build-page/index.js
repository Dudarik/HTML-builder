const path = require('path');

const { createReadStream, createWriteStream } = require('fs');
const { readdir, mkdir, rm, copyFile, readFile } = require('fs/promises');
const { pipeline } = require('stream');

const SRC_PATH = path.join(__dirname);
const DST_PATH = path.join(__dirname, 'project-dist');

const ASSETS_FOLDER = 'assets';
const STYLES_FOLDER = 'styles';
const COMPONENTS_FOLDER = 'components';

const HTML_Template = 'template.html';
const MAIN_FILENAME = 'index.html';
const CSS_BUNDLE_NAME = 'style.css';
const UTF8 = 'utf-8';

const createProjectFolder = async (dstPath, recursive = true, force = true) => {
  try {
    await rm(dstPath, { recursive, force });
    await mkdir(dstPath);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};

const copyAssetsFormSrcToDst = async (srcPath, dstPath, assetsFolder = '') => {
  srcPath = path.join(srcPath, assetsFolder);
  dstPath = path.join(dstPath, assetsFolder);

  const files = await readdir(srcPath, {
    withFileTypes: true,
  });

  if (files) {
    for (const file of files) {
      if (file.isDirectory()) {
        await mkdir(path.join(dstPath, file.name));
        await copyAssetsFormSrcToDst(
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

const getFileNames = async (srcPath, ext) => {
  try {
    let files = await readdir(srcPath);

    files = files.filter((file) => path.extname(file) === ext);

    return files.map((file) => path.join(srcPath, file));
  } catch (error) {
    console.error(error);
  }
  return false;
};

const createCssBundle = async (srcPath, dstPath, bundleName) => {
  await rm(path.join(dstPath, bundleName), { force: true });
  const files = await getFileNames(srcPath, '.css');

  if (files) {
    for (const file of files) {
      const input = createReadStream(file, UTF8);
      const output = createWriteStream(path.join(dstPath, bundleName), {
        flags: 'a',
      });

      pipeline(input, output, (err) => {
        if (err) console.error('this error', err);
      });
    }
    return true;
  }
  return false;
};

const createHTML = async (
  srcPath,
  dstPath,
  tplPath,
  componentsPath,
  mainFilename
) => {
  let htmlTpl = await readFile(path.join(srcPath, tplPath), UTF8);
  const files = await getFileNames(path.join(srcPath, componentsPath), '.html');
  if (htmlTpl && files) {
    // await rm(path.join(dstPath, mainFilename), { force: true });

    for (const file of files) {
      const component = await readFile(file, UTF8);
      const componentName = path.basename(file, path.extname(file));

      htmlTpl = htmlTpl.replaceAll(`{{${componentName}}}`, component);
    }

    const output = createWriteStream(path.join(dstPath, mainFilename));
    output.write(htmlTpl);

    return true;
  }
  return false;
};

const makeBundle = async (
  srcPath,
  dstPath,
  assetsFolder,
  stylesFolder,
  cssBundleName,
  htmlTplPath,
  componentsPath,
  mainFilename
) => {
  await createProjectFolder(dstPath);
  await createProjectFolder(path.join(dstPath, assetsFolder));
  await copyAssetsFormSrcToDst(srcPath, dstPath, assetsFolder);
  await createCssBundle(
    path.join(srcPath, stylesFolder),
    dstPath,
    cssBundleName
  );
  await createHTML(srcPath, dstPath, htmlTplPath, componentsPath, mainFilename);
};

makeBundle(
  SRC_PATH,
  DST_PATH,
  ASSETS_FOLDER,
  STYLES_FOLDER,
  CSS_BUNDLE_NAME,
  HTML_Template,
  COMPONENTS_FOLDER,
  MAIN_FILENAME
);
