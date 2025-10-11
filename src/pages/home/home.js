import { renderTemplate } from '../../core/render-template';
import template from './home.html?raw';

/**
 * @param {Object} props
 * @param {HTMLElement} props.element
 */
export function homePage(props) {
  const { element } = props;

  element.innerHTML = renderTemplate(template);
}
