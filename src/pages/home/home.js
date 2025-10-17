import { renderTemplate } from '@/core/render';
import template from './home.html?raw';
import './home.css';

/**
 * @param {Object} props
 * @param {HTMLElement} props.element
 */
export function homePage(props) {
  const { element } = props;

  element.innerHTML = renderTemplate(template);
}
