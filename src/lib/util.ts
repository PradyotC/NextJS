 /**
 * Converts a string to Sentence Case: capitalizes only the first letter.
 * @param str The input string.
 * @returns The capitalized string.
 */
export function toSentenceCase(str: string): string {
  if (!str) return str; // Handles empty or null strings

  // 1. Get the first character and convert it to uppercase.
  const firstLetter = str.charAt(0).toUpperCase();

  // 2. Get the rest of the string starting from the second character.
  const restOfString = str.slice(1);

  // 3. Combine them.
  return firstLetter + restOfString;
}