import { renderTemplate, renderList } from '@/core/render';
import template from './pantry.html?raw';
import pantryItemTemplate from './pantry-item.html?raw';
import emptyPantryTemplate from './empty-pantry.html?raw';
import { usePantry } from '@/hooks/use-pantry';
import './pantry.css';

/**
 * @param {{ element: HTMLElement }} props
 */
export function pantryPage({ element }) {
  const { addPantryItem, getPantryItems, removePantryItem } = usePantry();

  render();

  element.addEventListener('submit', (e) => {
    const form = e.target.closest('#addIngredientForm');
    if (!form) return;
    e.preventDefault();

    const input = form.querySelector('#ingredientInput');
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    addPantryItem(raw);
    render();

    const newInput = element.querySelector('#ingredientInput');
    if (newInput) newInput.focus();
  });

  element.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-button');
    if (!btn) return;
    const card = btn.closest('.pantry-item');
    const name = card?.getAttribute('data-item');
    if (!name) return;

    removePantryItem(name);
    render();
  });

  function render() {
    const items = getPantryItems();
    const itemsHTML = renderList(
      items,
      (pantryItem) => renderTemplate(pantryItemTemplate, { pantryItem }),
      { empty: emptyPantryTemplate },
    );

    element.innerHTML = renderTemplate(template, {
      items: itemsHTML,
      count: items.length,
    });
  }
}
