 // PUBLIC_INTERFACE
export function debounce(fn, delay = 400) {
  /** Debounce a function call by delay ms. */
  let timer = null;
  function wrapped(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return wrapped;
}
