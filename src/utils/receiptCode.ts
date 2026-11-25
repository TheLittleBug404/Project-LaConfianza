/**
 * Genera el código correlativo de recibo de préstamo:
 * Secuencia: A1, A2 ... A1000, B1, B2 ... B1000, C1 ... C1000, etc.
 * @param index - Índice secuencial entero base 0 (0 -> A1, 999 -> A1000, 1000 -> B1)
 */
export function generateReceiptCode(index: number): string {
  const safeIndex = Math.max(0, index);
  const seriesIndex = Math.floor(safeIndex / 1000);
  const numberInSeries = (safeIndex % 1000) + 1;
  
  // Letra A-Z según el bloque de 1000
  const letterCode = 65 + (seriesIndex % 26);
  const letter = String.fromCharCode(letterCode);
  const overflowPrefix = seriesIndex >= 26 ? String(Math.floor(seriesIndex / 26)) : '';

  return `${overflowPrefix}${letter}${numberInSeries}`;
}

/**
 * Calcula el siguiente código de recibo garantizando que no colisione con ninguno existente
 */
export function getNextReceiptCodeFromLoans(loans: { code?: string; receiptCode?: string }[]): string {
  let maxIndex = -1;
  const regex = /^([A-Z])(\d+)$/;
  
  loans.forEach(l => {
    const code = l.receiptCode || l.code || '';
    const match = code.match(regex);
    if (match) {
      const letter = match[1];
      const num = parseInt(match[2], 10);
      const seriesIndex = letter.charCodeAt(0) - 65;
      const idx = seriesIndex * 1000 + (num - 1);
      if (idx > maxIndex) {
        maxIndex = idx;
      }
    }
  });

  // Si no se encontraron códigos en formato A1..Z1000, usar loans.length
  return maxIndex >= 0 ? generateReceiptCode(maxIndex + 1) : generateReceiptCode(loans.length);
}

