import { attachBehavior } from './attach-behavior.js';
/**
 * @typedef {object} MountCtx
 * @property {Record<string, string>} [params]
 *
 * @typedef {object} Page
 * @property {string | ((ctx?: MountCtx) => string | Promise<string>)} [title]
 * @property {string | ((ctx?: MountCtx) => string | Promise<string>)} view
 * @property {(root: HTMLElement, ctx?: MountCtx) => void | (()=>void) | Promise<void | (()=>void)>} [behavior]
 */

/**
 * Render a Page (or Page factory) into root, set document.title, run behavior.
 * Accepts:
 *   - a Page object
 *   - a factory: (ctx) => Page
 *   - an async factory: (ctx) => Promise<Page>
 * Returns a cleanup fn.
 * @param {HTMLElement} root
 * @param {Page | ((ctx?: MountCtx) => Page | Promise<Page>)} pageOrFactory
 * @param {MountCtx} [ctx]
 */
export async function mount(root, pageOrFactory, ctx) {
  if (!(root instanceof HTMLElement)) throw new Error('mount: invalid root');

  // ✅ await factories (sync or async)
  const page = await (typeof pageOrFactory === 'function' &&
  !('view' in pageOrFactory)
    ? /** @type {(ctx?: MountCtx)=>Page|Promise<Page>} */ (pageOrFactory)(ctx)
    : /** @type {Page} */ (pageOrFactory));

  if (!page || (!page.view && typeof page.view !== 'function')) {
    throw new Error('mount: page.view must be a string or function');
  }

  const html =
    typeof page.view === 'function' ? await page.view(ctx) : page.view;
  root.innerHTML = html ?? '';

  if (page.title) {
    const t =
      typeof page.title === 'function' ? await page.title(ctx) : page.title;
    if (typeof t === 'string') document.title = t;
  }

  let cleanup = () => {};

  if (typeof page.behavior === 'function') {
    const maybe = await page.behavior(root, ctx);
    if (typeof maybe === 'function') cleanup = maybe;
  } else if (page.behavior && typeof page.behavior === 'object') {
    // ✅ support a single spec OR an array of specs
    const specs = Array.isArray(page.behavior)
      ? page.behavior
      : [page.behavior];
    const offs = [];

    for (const spec0 of specs) {
      const spec = { ...spec0 };
      if (typeof spec.element === 'string') {
        const found = root.querySelector(spec.element);
        if (!(found instanceof HTMLElement))
          throw new Error(`mount: element not found: ${spec.element}`);
        spec.element = found;
      }
      offs.push(attachBehavior(spec));
    }

    cleanup = () => {
      for (const off of offs) off?.();
    };
  }
}
