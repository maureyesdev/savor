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
import './recipe-detail.css';

/**
 * @param {{ element: HTMLElement }} props
 */
export async function recipeDetailPage({ element, params }) {
  const { getById } = useTheMealDb();
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

    const nutritionSummary = renderList(nutrition.nutrients, (nutrient) =>
      renderTemplate(nutrientHtml, { nutrient }),
    );

    const macroNutrients = renderTemplate(macroNutrientsHtml, {
      percentProtein,
      percentFat,
      percentCarbs,
    });

    element.innerHTML = renderTemplate(template, {
      title: recipe.title,
      image: recipe.image,
      category,
      area,
      tags,
      ingredients,
      steps,
      nutritionSummary,
      macroNutrients,
    });
  }
}
