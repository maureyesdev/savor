import template from './not-found.html?raw';
import { renderTemplate } from '../../core/render-template';

/**
 * @param {Object} props
 * @param {HTMLElement} props.element
 */
export function notFoundPage({ element }) {
  element.innerHTML = renderTemplate(template);
}
