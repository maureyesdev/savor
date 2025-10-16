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

  async function getById(id, { signal } = {}) {
    const res = await fetch(
      `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`,
      { signal },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const recipe = data?.meals?.[0];
    if (!recipe) return null;

    // Build ingredients array (skip empties)
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = (recipe[`strIngredient${i}`] || '').trim();
      const meas = cleanMeasure(recipe[`strMeasure${i}`] || '');
      if (!ing) continue;
      ingredients.push({ ingredient: ing, measure: meas });
    }

    const rawInstructions = recipe.strInstructions ?? '';
    const steps = splitIntoSteps(rawInstructions);

    const tags = (recipe.strTags || '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const youtube = toNullIfEmpty(recipe.strYoutube);
    const youtubeId = youtube ? ytIdFromUrl(youtube) : null;

    return {
      id: recipe.idMeal,
      title: recipe.strMeal?.trim() || 'Untitled',
      image: toNullIfEmpty(recipe.strMealThumb),
      category: toNullIfEmpty(recipe.strCategory),
      area: toNullIfEmpty(recipe.strArea),
      tags,
      // Both forms: the full, normalized string and split steps
      instructions: collapseBlankLines(normalizeNewlines(rawInstructions)),
      instructionSteps: steps,
      youtube: youtubeId ? { id: youtubeId, url: youtube } : null,
      ingredients, // [{ ingredient, measure }]
      source: toNullIfEmpty(recipe.strSource),
    };
  }
  return { searchByIngredient, getById };
}

function normalizeNewlines(s = '') {
  return s.replace(/\r\n?/g, '\n');
}

function collapseBlankLines(s = '') {
  return s.replace(/\n{3,}/g, '\n\n').trim();
}

function splitIntoSteps(instructions = '') {
  const txt = collapseBlankLines(normalizeNewlines(instructions));

  // Split on number-only lines between newlines
  const rawParts = txt.split(/\n\s*\d+\s*\n/g);

  // If we actually split into multiple parts, clean them up
  const parts = rawParts
    .map((p) => p.replace(/\s+/g, ' ').trim()) // <- trims leading space reliably
    .filter(Boolean);

  // Fallback if no numeric separators were found: one trimmed chunk
  return parts.length ? parts : [txt.replace(/\s+/g, ' ').trim()];
}

function toNullIfEmpty(s) {
  const t = (s ?? '').trim();
  return t ? t : null;
}
function cleanMeasure(s) {
  return (s ?? '').replace(/\s+/g, ' ').trim(); // collapse weird spacing
}
function ytIdFromUrl(url = '') {
  const m =
    url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
