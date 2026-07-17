/**
 * Convert a number to its Indian English words representation.
 * Supports values up to 99,99,99,999 (99 crore).
 */
export function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  if (num < 0) return "Minus " + numberToWords(-num);
  if (!Number.isInteger(num)) {
    const intPart = Math.floor(num);
    return numberToWords(intPart);
  }

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertBelowHundred(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function convertBelowThousand(n: number): string {
    if (n < 100) return convertBelowHundred(n);
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " and " + convertBelowHundred(n % 100) : "")
    );
  }

  // Indian numbering: Thousand, Lakh, Crore
  let result = "";
  if (num >= 10000000) {
    result += convertBelowHundred(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (num >= 100000) {
    result += convertBelowHundred(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertBelowHundred(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num > 0) {
    result += convertBelowThousand(num);
  }

  return result.trim() + " Rupees Only";
}
