import { renderTemplate } from '@/core/render';
import template from './not-found.html?raw';

/**
 * @param {Object} props
 * @param {HTMLElement} props.element
 */
export function notFoundPage({ element }) {
  element.innerHTML = renderTemplate(template);
}
