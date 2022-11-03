const { stdout, stdin } = process;

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const FILE_NAME = 'output.txt';
const PATH = path.join(__dirname, FILE_NAME);
const UTF8 = 'utf-8';
const HELLO_STR = 'Hello Friend! Please input text here: ';
const BYE_STR = 'Goodbye my friend!';

const readStream = fs.createReadStream(PATH, UTF8);

stdout.write(HELLO_STR);

let fileBody = '';

readStream.on('data', (chunck) => {
  if (chunck) fileBody += chunck;
});

readStream.on('error', (err) => {
  if (err.code === 'ENOENT') {
    fs.createWriteStream(PATH);
  }
});

stdin.on('data', (data) => {
  const currentString = data.toString().trim();

  if (currentString === 'exit') {
    console.log(BYE_STR);
    process.exit();
  }
  const writeStream = fs.createWriteStream(PATH);

  fileBody += currentString + '\n';

  writeStream.write(fileBody);
  stdout.write(HELLO_STR);
});

process.on('SIGINT', () => {
  readline.clearLine(process.stdout, 0);
  console.log('\n' + BYE_STR);
  process.exit();
});
