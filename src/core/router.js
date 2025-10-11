/**
 * @typedef {{ element: HTMLElement, params: Record<string,string> }} PageCtx
 * @typedef {(ctx: PageCtx) => (void | (()=>void) | {cleanup: ()=>void, api?: Record<string, any>} | Promise<void | (()=>void) | {cleanup: ()=>void, api?: Record<string, any>} )} PageFn
 * @typedef {{ path: string, page: PageFn }} Route
 */

/**
 * Create a tiny History API router with async page + cleanup support.
 * Accepts page/notFound returning:
 *   - nothing
 *   - a cleanup function
 *   - or { cleanup, api? }
 * @param {{ root: HTMLElement, routes: Route[], notFound?: PageFn }} options
 */
export function createHistoryRouter({ root, routes, notFound }) {
  if (!(root instanceof HTMLElement)) throw new Error('router: invalid root');

  const compiled = routes.map((r) => ({ ...r, ...compilePath(r.path) }));
  /** @type {null | (()=>void | Promise<void>)} */
  let cleanup = null;

  async function render({ fromPopstate = false } = {}) {
    const path = window.location.pathname;
    const match = matchRoute(path, compiled);
    const params = match?.params ?? {};
    const page = match?.route?.page || notFound;

    // teardown previous page (supports async cleanup)
    if (cleanup) {
      try {
        await cleanup();
      } catch {}
      cleanup = null;
    }

    // render page
    root.innerHTML = '';
    if (typeof page === 'function') {
      const result = await page({ element: root, params });

      // normalize possible return shapes
      if (typeof result === 'function') {
        cleanup = result;
      } else if (
        result &&
        typeof result === 'object' &&
        typeof result.cleanup === 'function'
      ) {
        cleanup = result.cleanup;
        // result.api is allowed but unused here; parent can capture if needed
      }
    } else {
      root.innerHTML = `<h1>404</h1><p>Not found</p>`;
    }

    if (!fromPopstate) window.scrollTo(0, 0);
  }

  function navigate(to) {
    const url = to.startsWith('/') ? to : '/' + to;
    if (url === window.location.pathname) return;
    history.pushState({}, '', url);
    render();
  }

  // Intercept internal links: <a href="/path" data-nav>
  const onLinkClick = (e) => {
    const a = e.target.closest('a[data-nav]');
    if (!a) return;
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      a.target === '_blank'
    )
      return;

    const href = a.getAttribute('href');
    if (!href || /^https?:\/\//i.test(href)) return; // external
    e.preventDefault();
    navigate(href);
  };

  const onPop = () => render({ fromPopstate: true });

  document.addEventListener('click', onLinkClick);
  window.addEventListener('popstate', onPop);
  render();

  return {
    navigate,
    destroy: async () => {
      document.removeEventListener('click', onLinkClick);
      window.removeEventListener('popstate', onPop);
      if (cleanup) {
        try {
          await cleanup();
        } catch {}
        cleanup = null;
      }
    },
  };
}

/* ---------------- helpers ---------------- */

function compilePath(path) {
  const keys = [];
  const regex = new RegExp(
    '^' +
      path
        .replace(/\/:([^/]+)/g, (_, k) => {
          keys.push(k);
          return '/([^/]+)';
        })
        .replace(/\/$/, '') +
      '/?$',
  );
  return { regex, keys };
}

function matchRoute(path, compiled) {
  for (const r of compiled) {
    const m = path.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { route: r, params };
    }
  }
  return null;
}
