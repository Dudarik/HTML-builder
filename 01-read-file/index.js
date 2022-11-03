const fs = require("fs");
const path = require("path");

const FILENAME = "text.txt";
const UTF8 = "utf-8";
const PATH = path.join(__dirname, FILENAME);
const readStream = fs.createReadStream(PATH, UTF8);

readStream.on("data", (chunck) => console.log(chunck));
