import fs from 'fs'
// run the following only on windows

const OPENSSL_DIR = process.env.OPENSSL_DIR;
const OPENSSL_INCLUDE_DIR = process.env.OPENSSL_INCLUDE_DIR;
const OPENSSL_LIB_DIR = process.env.OPENSSL_LIB_DIR;

console.log("OPENSSL_DIR", OPENSSL_DIR);
console.log("OPENSSL_INCLUDE_DIR", OPENSSL_INCLUDE_DIR);
console.log("OPENSSL_LIB_DIR", OPENSSL_LIB_DIR);


if (process.platform === 'win32') {
  
  // check if each directory exists
  if (!OPENSSL_DIR || !OPENSSL_INCLUDE_DIR || !OPENSSL_LIB_DIR) {
    console.error("OPENSSL_DIR, OPENSSL_INCLUDE_DIR, or OPENSSL_LIB_DIR is not set");
    process.exit(1);
  }
  
  // check if each directory exists
  if (!fs.existsSync(OPENSSL_DIR)) {
    console.error("OPENSSL_DIR does not exist", OPENSSL_DIR);
    process.exit(1);
  } else {
    console.log("OPENSSL_DIR exists", OPENSSL_DIR);
  }
  if (!fs.existsSync(OPENSSL_INCLUDE_DIR)) {
    console.error("OPENSSL_INCLUDE_DIR does not exist", OPENSSL_INCLUDE_DIR);
    process.exit(1);
  } else {
    console.log("OPENSSL_INCLUDE_DIR exists", OPENSSL_INCLUDE_DIR);
  }
  if (!fs.existsSync(OPENSSL_LIB_DIR)) {
    console.error("OPENSSL_LIB_DIR does not exist", OPENSSL_LIB_DIR);
    process.exit(1);
  } else {
    console.log("OPENSSL_LIB_DIR exists", OPENSSL_LIB_DIR);
  }
} else if (process.platform === "darwin") {
  if (OPENSSL_DIR) {
    if (fs.existsSync(OPENSSL_DIR)) {
      console.log("OPENSSL_DIR exists", OPENSSL_DIR);
    } else {
      console.error("OPENSSL_DIR does not exist", OPENSSL_DIR);
    }

  }
} else if (process.platform === "linux") {
  
}
