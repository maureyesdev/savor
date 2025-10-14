export function useTheMealDb() {
  const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

  const searchByIngredient = async (ingredient) => {
    const query = (ingredient || '').trim().toLowerCase();
    if (!query) return [];
    const url = `${BASE_URL}/filter.php?i=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Error fetching recipes:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data.meals ?? [];
  };

  return { searchByIngredient };
}
