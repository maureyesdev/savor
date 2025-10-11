export function withLayout(page, { header, footer } = {}) {
  return async ({ element, params }) => {
    const headerEl = document.createElement('header');
    const mainEl = document.createElement('main');
    const footerEl = document.createElement('footer');

    element.replaceChildren(headerEl, mainEl, footerEl);

    const cleanups = [];

    if (header) {
      const res = await header({ element: headerEl });
      if (typeof res === 'function') cleanups.push(res);
    }

    const res = await page({ element: mainEl, params });
    if (typeof res === 'function') cleanups.push(res);
    else if (res && typeof res.cleanup === 'function')
      cleanups.push(res.cleanup);

    if (footer) {
      const res = await footer({ element: footerEl });
      if (typeof res === 'function') cleanups.push(res);
    }

    return () => cleanups.forEach((c) => c?.());
  };
}
