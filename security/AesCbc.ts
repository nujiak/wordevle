const CryptoJS = require("crypto-js");

export function encrypt(message: string): string {
  return CryptoJS.AES.encrypt(message, process.env.QUERY_ENCRYPTION_KEY || "SUP3Rs3cr3tK3Y$THX4pl4yingWORDEVLEbtw<3");
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.QUERY_ENCRYPTION_KEY || "SUP3Rs3cr3tK3Y$THX4pl4yingWORDEVLEbtw<3");
  return bytes.toString(CryptoJS.enc.Utf8);
}
