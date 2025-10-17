import { renderTemplate, renderList } from '@/core/render';
import template from './recipe-detail.html?raw';
import { useTheMealDb } from '@hooks/use-the-meal-db';
import { useSpoonacular } from '@hooks/use-spoonacular';
import badgeHtml from './badge.html?raw';
import chipHtml from './chip.html?raw';
import ingredientHtml from './ingredient.html?raw';
import stepHtml from './step.html?raw';
import nutrientHtml from './nutrient.html?raw';
import macroNutrientsHtml from './macro-nutrients.html?raw';
import { usePantry } from '@hooks/use-pantry';
import './recipe-detail.css';

const INGREDIENT_IN_PANTRY_BACKGROUND_COLOR = '#ecfdf5';
const INGREDIENT_IN_PANTRY_BORDER_COLOR = '#c6f6d5';
const INGREDIENT_NOT_IN_PANTRY_BACKGROUND_COLOR = '#fecaca';
const INGREDIENT_NOT_IN_PANTRY_BORDER_COLOR = '#fff1f2';

/**
 * @param {{ element: HTMLElement }} props
 */
export async function recipeDetailPage({ element, params }) {
  const { getById } = useTheMealDb();
  const { getPantryItems } = usePantry();
  const id = params?.id;
  const recipe = await getById(id);
  if (!recipe) {
    element.innerHTML = '<p>Recipe not found.</p>';
    return;
  }
  const { getNutritionAnalysis } = useSpoonacular();
  const { nutrition } = await getNutritionAnalysis({
    title: recipe.title,
    servings: 1,
    ingredients: recipe.ingredients.map((i) => `${i.measure} ${i.ingredient}`),
    instructions: recipe.instructions,
  });

  render();

  function render() {
    const { percentProtein, percentFat, percentCarbs } =
      nutrition.caloricBreakdown;

    const category = renderTemplate(badgeHtml, { value: recipe.category });

    const area = renderTemplate(badgeHtml, { value: recipe.area });

    const tags = renderList(recipe.tags, (tag) =>
      renderTemplate(chipHtml, { value: tag }),
    );

    const ingredients = renderList(recipe.ingredients, (ingredient) =>
      renderTemplate(ingredientHtml, { ingredient }),
    );

    const steps = renderList(recipe.instructionSteps, (step) =>
      renderTemplate(stepHtml, { step }),
    );

    const nutritionSummary = renderList(
      nutrition.nutrients,
      (nutrient) => renderTemplate(nutrientHtml, { nutrient }),
      { empty: 'no available' },
    );

    const macroNutrients = renderTemplate(macroNutrientsHtml, {
      percentProtein: percentProtein ?? 'not available',
      percentFat: percentFat ?? 'not available',
      percentCarbs: percentCarbs ?? 'not available',
    });

    const pantryItems = getPantryItems();
    const ingredientNames = recipe.ingredients.map(({ ingredient }) =>
      ingredient.toLowerCase().trim(),
    );
    const missingIngredientsFromPantry = ingredientNames.filter(
      (ingredient) =>
        !pantryItems
          .map((pantryItem) => pantryItem.toLowerCase().trim())
          .includes(ingredient),
    );
    const havingIngredientsFromPantry = ingredientNames.filter((ingredient) =>
      pantryItems
        .map((pantryItem) => pantryItem.toLowerCase().trim())
        .includes(ingredient),
    );
    const missingIngredientsFromPantryHtml = renderList(
      missingIngredientsFromPantry,
      (ingredient) =>
        renderTemplate(chipHtml, {
          value: ingredient,
          backgroundColor: INGREDIENT_NOT_IN_PANTRY_BACKGROUND_COLOR,
          borderColor: INGREDIENT_NOT_IN_PANTRY_BORDER_COLOR,
        }),
      { empty: 'none' },
    );
    const havingIngredientsFromPantryHtml = renderList(
      havingIngredientsFromPantry,
      (ingredient) =>
        renderTemplate(chipHtml, {
          value: ingredient,
          backgroundColor: INGREDIENT_IN_PANTRY_BACKGROUND_COLOR,
          borderColor: INGREDIENT_IN_PANTRY_BORDER_COLOR,
        }),
      { empty: 'none' },
    );

    element.innerHTML = renderTemplate(template, {
      title: recipe.title,
      image: recipe.image,
      category,
      area,
      tags,
      ingredients,
      steps,
      nutritionSummary: nutritionSummary,
      macroNutrients,
      pantryItems: `${havingIngredientsFromPantryHtml}${missingIngredientsFromPantryHtml}`,
    });
  }
}
