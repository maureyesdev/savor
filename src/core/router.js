import { mount } from './mount.js';

/**
 * @typedef {{ path: string, page: () => {view: string|(()=>string|Promise<string>), behavior?: (root:HTMLElement)=>void|(()=>void)|Promise<void|(()=>void)>} }} Route
 */

/**
 * Create a tiny hash-router.
 * @param {{ root: HTMLElement, routes: Route[], mount: (root:HTMLElement, page: any)=>Promise<()=>void>|(()=>void), notFound?: ()=>any }} opts
 */
export function createHashRouter({ root, routes, notFound }) {
  if (!(root instanceof HTMLElement)) throw new Error('router: invalid root');

  let cleanup = null;

  const normalize = (hash) => {
    const raw = (hash || '#/').replace(/^#/, '');
    return raw.startsWith('/') ? raw : '/' + raw;
  };

  const findRoute = (path) => routes.find((r) => r.path === path);

  async function render() {
    const path = normalize(window.location.hash);
    const route =
      findRoute(path) || (notFound ? { path, page: notFound } : null);

    if (!route) {
      root.innerHTML = `<h1>404</h1><p>Route not found.</p>`;
      return;
    }

    // tear down previous page
    if (cleanup) {
      try {
        cleanup();
      } catch {
        /* ignore */
      }
      cleanup = null;
    }

    // mount the new page
    const maybeCleanup = await mount(root, route.page);
    if (typeof maybeCleanup === 'function') cleanup = maybeCleanup;
  }

  function navigate(to) {
    const hash = to.startsWith('#')
      ? to
      : '#' + (to.startsWith('/') ? to.slice(1) : to);
    if (window.location.hash === hash) return; // no-op
    window.location.hash = hash;
  }

  function onLinkClick(e) {
    const a = e.target.closest('a[data-nav]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('/')) {
      e.preventDefault();
      navigate(href.startsWith('#') ? href : '#' + href);
    }
  }

  window.addEventListener('hashchange', render);
  document.addEventListener('click', onLinkClick);
  // initial render
  render();

  return {
    navigate,
    destroy() {
      window.removeEventListener('hashchange', render);
      document.removeEventListener('click', onLinkClick);
      if (cleanup) cleanup();
      cleanup = null;
    },
  };
}

/**
 * @typedef {{ path: string, page: () => {view: string|(()=>string|Promise<string>), behavior?: (root:HTMLElement)=>void|(()=>void)|Promise<void|(()=>void)>} }} Route
 */
// utils/history-router.js (patch)
export function createHistoryRouter({ root, routes, notFound }) {
  if (!(root instanceof HTMLElement)) throw new Error('router: invalid root');
  let cleanup = null;

  // Precompile param routes like /products/:id
  const compiled = routes.map((r) => ({
    ...r,
    ...compilePath(r.path), // { regex, keys }
  }));

  const curPath = () => location.pathname || '/';

  async function render({ fromPopstate = false } = {}) {
    const path = curPath();

    // match path (supports params)
    let match = compiled.find((r) => r.regex.test(path));
    let params = {};
    if (match) {
      const m = path.match(match.regex);
      match.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    } else if (notFound) {
      match = { page: notFound };
    }

    if (!match) {
      root.innerHTML = `<h1>404</h1>`;
      return;
    }

    if (cleanup) {
      try {
        cleanup();
      } catch {}
      cleanup = null;
    }

    // page factory can accept ctx with params
    const pageFactory = match.page;
    const maybeCleanup = await mount(root, () => pageFactory({ params }));
    if (typeof maybeCleanup === 'function') cleanup = maybeCleanup;

    // update title if page provided one
    const page = pageFactory({ params });
    if (page && page.title) document.title = page.title;

    // scroll to top on programmatic navigation (keep position on back/forward)
    if (!fromPopstate) window.scrollTo(0, 0);

    // mark active link
    updateActiveLinks();
  }

  function navigate(to) {
    const url = to.startsWith('/') ? to : '/' + to;
    if (url === location.pathname) return;
    history.pushState({}, '', url);
    render();
  }

  function onLinkClick(e) {
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
  }

  function onPop() {
    render({ fromPopstate: true });
  }

  window.addEventListener('popstate', onPop);
  document.addEventListener('click', onLinkClick);
  render();

  return {
    navigate,
    destroy() {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onLinkClick);
      if (cleanup) cleanup();
      cleanup = null;
    },
  };
}

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

function updateActiveLinks() {
  document.querySelectorAll('a[data-nav]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const url = new URL(href, location.origin);
    a.classList.toggle(
      'is-active',
      url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, ''),
    );
  });
}
