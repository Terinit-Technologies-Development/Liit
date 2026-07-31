/**
 * Minimal prototype-safe nanoid replacement.
 * Generates a URL-safe random ID without native crypto.
 */
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nanoid(size = 16): string {
  let result = "";
  for (let i = 0; i < size; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return result;
}
