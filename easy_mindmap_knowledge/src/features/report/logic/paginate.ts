/** How many pages `total` items take; 0 when there is nothing to show (the screen then reads "0/0"). */
export function pageCount(total: number, size: number): number {
  return Math.ceil(total / size);
}
