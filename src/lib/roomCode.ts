import { customAlphabet } from "nanoid";

// Avoids ambiguous characters (0/O, 1/I/L) for codes read aloud or typed by hand.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export const generateRoomCode = customAlphabet(ALPHABET, 5);

export function isValidRoomCode(code: string): boolean {
  return /^[23456789A-HJ-NP-Z]{3,12}$/i.test(code);
}
