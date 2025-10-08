const __store = new WeakMap(); // el -> { state: {}, listeners: Array<{event, handler, options}> }

/**
 * Attach a tiny "behavior" to an element with optional state & events.
 * @param {Object} options
 * @param {HTMLElement|string} options.element
 * @param {object} [options.state]
 * @param {string} [options.event='click']
 * @param {(ctx: Ctx)=>void} [options.onInit]   // runs once
 * @param {(ctx: Ctx)=>void} [options.onEvent]  // runs on event
 * @param {AddEventListenerOptions|boolean} [options.eventOptions]
 * @returns {() => void} cleanup
 */
export function attachBehavior({
  element,
  state = {},
  event = 'click',
  onInit,
  onEvent,
  eventOptions,
}) {
  const el =
    typeof element === 'string' ? document.querySelector(element) : element;
  if (!(el instanceof HTMLElement))
    throw new Error('Invalid element. Use a selector or an HTMLElement.');

  // create or reuse element-scoped record
  let rec = __store.get(el);
  if (!rec) {
    rec = { state: { ...state }, listeners: [] };
    __store.set(el, rec);
  } else {
    // merge in any new initial state keys without nuking existing state
    Object.assign(rec.state, state);
  }

  // helpers
  const ctx = {
    el,
    state: rec.state,
    setHTML: (html) => (el.innerHTML = html),
    setText: (text) => (el.textContent = text),
    update: (fn) => Object.assign(rec.state, fn(rec.state)),
  };

  // initial pass
  if (typeof onInit === 'function') onInit(ctx);

  // optional event wiring
  let handler;
  if (typeof onEvent === 'function') {
    handler = () => onEvent(ctx);
    el.addEventListener(event, handler, eventOptions);
    rec.listeners.push({ event, handler, options: eventOptions });
  }

  // return cleanup for this specific attachment
  return () => {
    if (handler) {
      el.removeEventListener(event, handler, eventOptions);
      rec.listeners = rec.listeners.filter((l) => l.handler !== handler);
    }
    if (rec.listeners.length === 0) {
      __store.delete(el); // drop state when no listeners remain
    }
  };
}

/** Remove ALL behaviors for an element (handy for HMR/teardown). */
export function detachBehavior(element) {
  const el =
    typeof element === 'string' ? document.querySelector(element) : element;
  if (!(el instanceof HTMLElement)) return;
  const rec = __store.get(el);
  if (!rec) return;
  for (const { event, handler, options } of rec.listeners) {
    el.removeEventListener(event, handler, options);
  }
  __store.delete(el);
}

/**
 * @typedef {{
 *  el: HTMLElement,
 *  state: Record<string, any>,
 *  setHTML(html: string): void,
 *  setText(text: string): void,
 *  update(fn: (s: any) => any): void
 * }} Ctx
 */
