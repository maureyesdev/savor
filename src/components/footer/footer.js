import footerHtml from './footer.html?raw';
import { renderTemplate } from '@/core/render';
import './footer.css';

export function footer({ element }) {
  const year = new Date().getFullYear();
  element.innerHTML = renderTemplate(footerHtml, { year });
}
