import { withLayout } from '@/core/with-layout';
import { homePage } from '@/pages/home/home';
import { pantryPage } from '@/pages/pantry/pantry';
import { recipeDetailPage } from '@/pages/recipe-detail/recipe-detail';
import { recipesPage } from '@/pages/recipes/recipes';

export const routes = [
  { path: '/', page: withLayout(homePage) },
  { path: '/pantry', page: pantryPage },
  { path: '/recipes', page: recipesPage },
  { path: '/recipes/:id', page: recipeDetailPage },
];
