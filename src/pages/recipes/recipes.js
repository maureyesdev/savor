import { renderTemplate, renderList } from '@/core/render';
import pageHtml from './recipes.html?raw';
import cardHtml from './recipe-card.html?raw';
import { useTheMealDb } from '@hooks/use-the-meal-db';
import { usePantry } from '@hooks/use-pantry';
import './recipes.css';

/**
 * @param {{ element: HTMLElement }} props
 */
export async function recipesPage({ element }) {
  const { getPantryItems } = usePantry();
  const pantry = getPantryItems();
  const recipes = await getRecipesBasedOnPantry(pantry);

  render();

  function render() {
    element.innerHTML = renderTemplate(pageHtml, {
      resultsCount: recipes.length,
      recipes: renderList(
        recipes,
        (recipe) => {
          const { idMeal: id, strMeal: title, strMealThumb: image } = recipe;
          return renderTemplate(cardHtml, { id, image, title });
        },
        // TODO: Need to improve this empty state
        { empty: '<p>No recipes found. Try adding items to your pantry!</p>' },
      ),
    });
  }
}

// TODO: this needs to be moved to its recipes service orchestrator
async function getRecipesBasedOnPantry(pantry) {
  if (pantry.length === 0) return [];
  const { searchByIngredient } = useTheMealDb();
  const recipesMap = new Map();
  const promises = pantry.map((item) => searchByIngredient(item));
  const results = await Promise.all(promises);
  results.flat().forEach((recipe) => {
    if (!recipesMap.has(recipe.idMeal)) {
      recipesMap.set(recipe.idMeal, recipe);
    }
  });
  return Array.from(recipesMap.values());
}
