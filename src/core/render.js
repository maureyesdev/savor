// src/core/template.js
/**
 * Replace {{placeholders}} in an HTML string.
 */
export function renderTemplate(html, values = {}) {
  return html.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const val = key
      .trim()
      .split('.')
      .reduce((acc, k) => (acc ?? {})[k], values);
    return val != null ? String(val) : '';
  });
}

/**
 * Map an array to HTML and join. Optionally provide empty fallback.
 * @template T
 * @param {T[]} items
 * @param {(item: T, idx: number) => string} renderItem
 * @param {{ empty?: string, join?: string }} [opts]
 * @returns {string}
 */
export function renderList(items, renderItem, opts = {}) {
  const { empty = '', join = '' } = opts;
  if (!items || items.length === 0) return empty;
  let out = '';
  for (let i = 0; i < items.length; i++)
    out += (i ? join : '') + renderItem(items[i], i);
  return out;
}
