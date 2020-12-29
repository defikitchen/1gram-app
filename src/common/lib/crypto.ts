import crypto from "crypto";

// Key must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

export const encrypt = (text: string, key: string) => {
  if (!text || !key) return "";
  if (key.length === 6) key += "                          ";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (text = "", key: string) => {
  if (!text || !key) return "";
  if (key.length === 6) key += "                          ";
  let textParts = text.split(":");
  const iv = Buffer.from(textParts.shift() as any, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
