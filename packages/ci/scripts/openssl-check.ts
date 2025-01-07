import fs from 'fs'

const OPENSSL_DIR = process.env.OPENSSL_DIR;
const OPENSSL_INCLUDE_DIR = process.env.OPENSSL_INCLUDE_DIR;
const OPENSSL_LIB_DIR = process.env.OPENSSL_LIB_DIR;

console.log("OPENSSL_DIR", OPENSSL_DIR);
console.log("OPENSSL_INCLUDE_DIR", OPENSSL_INCLUDE_DIR);
console.log("OPENSSL_LIB_DIR", OPENSSL_LIB_DIR);

// check if each directory exists
if (!OPENSSL_DIR || !OPENSSL_INCLUDE_DIR || !OPENSSL_LIB_DIR) {
  console.error("OPENSSL_DIR, OPENSSL_INCLUDE_DIR, or OPENSSL_LIB_DIR is not set");
  process.exit(1);
}

// check if each directory exists
if (!fs.existsSync(OPENSSL_DIR)) {
  console.error("OPENSSL_DIR does not exist", OPENSSL_DIR);
  process.exit(1);
}
if (!fs.existsSync(OPENSSL_INCLUDE_DIR)) {
  console.error("OPENSSL_INCLUDE_DIR does not exist", OPENSSL_INCLUDE_DIR);
  process.exit(1);
}
if (!fs.existsSync(OPENSSL_LIB_DIR)) {
  console.error("OPENSSL_LIB_DIR does not exist", OPENSSL_LIB_DIR);
  process.exit(1);
}
