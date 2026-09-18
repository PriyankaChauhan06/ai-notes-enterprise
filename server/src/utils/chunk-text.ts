export function chunkText(text: string, chunkSize = 800, overlap = 120) {
  const cleanText = text.trim();
  if (!cleanText) return [];

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);

    const chunk = cleanText.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (end === cleanText.length) {
      break;
    }

    start += chunkSize - overlap;
  }

  return chunks;
}
