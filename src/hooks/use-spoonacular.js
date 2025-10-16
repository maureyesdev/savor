export function useSpoonacular() {
  async function getNutritionAnalysis({
    title = '',
    servings = 1,
    ingredients = [],
    instructions = '',
  }) {
    const baseUrl = 'https://api.spoonacular.com';
    const response = await fetch(
      `${baseUrl}/recipes/analyze?includeNutrition=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SPOONACULAR_API_KEY,
        },
        body: JSON.stringify({ title, servings, ingredients, instructions }),
      },
    );
    const data = await response.json();
    return data;
  }

  return { getNutritionAnalysis };
}
