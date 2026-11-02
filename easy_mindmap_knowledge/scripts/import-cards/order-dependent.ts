const ORDER_DEPENDENT =
  /all of the above|none of the above|both [A-F] and [A-F]|\b(options?|answers?) [A-F]\b/i;

export function isOrderDependent(optionTexts: string[]): boolean {
  return optionTexts.some((t) => ORDER_DEPENDENT.test(t));
}
