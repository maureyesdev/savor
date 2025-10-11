import { header } from '../components/header/header';
import { footer } from '../components/footer/footer';

/**
 * Minimal layout wrapper. Renders header/content/footer and then mounts the page
 * into the content slot. Works with sync or async pages and forwards cleanup.
 *
 * @param {(ctx: { element: HTMLElement, params: Record<string,string> }) => (void|(()=>void)|Promise<void|(()=>void)>)} page
 * @param {{
 *   header?: string | ((root: HTMLElement) => string),
 *   footer?: string | ((root: HTMLElement) => string),
 * }} [slots]
 * @returns {(ctx: { element: HTMLElement, params: Record<string,string> }) => Promise<void|(()=>void)>}
 */
/**
 * DOM-mutation version of withLayout
 * Allows header/footer functions that receive { element } and set innerHTML directly.
 */
export function withLayout(page, slots = {}) {
  return async ({ element, params }) => {
    // Clear root
    element.innerHTML = '';

    // Create DOM sections
    const headerEl = document.createElement('header');
    headerEl.dataset.slot = 'header';

    const mainEl = document.createElement('main');
    mainEl.dataset.slot = 'content';

    const footerEl = document.createElement('footer');
    footerEl.dataset.slot = 'footer';

    // Inject header
    if (typeof slots.header === 'function') {
      slots.header({ element: headerEl });
    } else {
      header({ element: headerEl });
    }

    // Inject footer
    if (typeof slots.footer === 'function') {
      slots.footer({ element: footerEl });
    } else {
      footer({ element: footerEl });
    }

    // Assemble layout
    element.append(headerEl, mainEl, footerEl);

    // Mount page content
    const maybeCleanup = await page({ element: mainEl, params });
    return typeof maybeCleanup === 'function' ? maybeCleanup : undefined;
  };
}
