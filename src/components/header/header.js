import template from './header.html?raw';
import { renderTemplate } from '../../core/render-template';

export function header({ element }) {
  element.innerHTML = renderTemplate(template);
}
