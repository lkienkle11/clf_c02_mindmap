let locks = 0;
let saved = { overflow: '', paddingRight: '' };

/** Stops the page behind a modal from scrolling; nested locks hold until the last is released. */
export function lockScroll(): () => void {
  const root = document.documentElement;
  if (locks++ === 0) {
    saved = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) {
      root.style.overflow = saved.overflow;
      root.style.paddingRight = saved.paddingRight;
    }
  };
}
