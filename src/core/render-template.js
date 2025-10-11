/**
 * Replace {{placeholders}} in an HTML string with given values.
 *
 * @param {string} html - Raw HTML string (e.g. from `import ...?raw`)
 * @param {Record<string, string|number|boolean>} values - Key/value map
 * @returns {string} Processed HTML
 */
export function renderTemplate(html, values = {}) {
  return html.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = values[key.trim()];
    return value != null ? String(value) : '';
  });
}
