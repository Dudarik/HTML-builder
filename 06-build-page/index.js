const path = require('path');

const { createWriteStream } = require('fs');
const { readdir, mkdir, rm, copyFile, readFile } = require('fs/promises');
// const { pipeline } = require('stream');

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

const getFileNamesFromTpl = (srcPath, tpl) => {
  const regExp = /{{[a-zA-Z0-9_]+}}/gim;
  const res = [];

  tpl = tpl.match(regExp).map((item) =>
    path.join(
      srcPath,
      item
        .split('')
        .filter((item) => item !== '{' && item !== '}')
        .join('') + '.css'
    )
  );
  for (let item of tpl) {
    if (path.basename(item) === 'articles.css')
      item = path.join(path.dirname(item), 'main.css');

    if (res.includes(item)) continue;
    res.push(item);
  }
  // console.log(res);
  return res;
};

const createCssBundle = async (srcPath, dstPath, bundleName, tplPath) => {
  await rm(path.join(dstPath, bundleName), { force: true });

  let htmlTpl = await readFile(path.join(srcPath, '..', tplPath), UTF8);

  const files = getFileNamesFromTpl(path.join(srcPath), htmlTpl);

  //const files = await getFileNames(srcPath, '.css');

  if (files) {
    for (const file of files) {
      let input;
      try {
        input = await readFile(file, UTF8);
        input += '\n';
      } catch (error) {
        console.log('');
      }

      // input.pipe(output);
      // pipeline(input, output, '\n', (err) => {
      //   if (err) console.error('this error', err);
      // });
      const output = createWriteStream(path.join(dstPath, bundleName), {
        flags: 'a',
      });

      output.write(input);
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
    cssBundleName,
    htmlTplPath
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
