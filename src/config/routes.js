import { withLayout } from '@/core/with-layout';
import { homePage } from '@/pages/home/home';
import { pantryPage } from '@/pages/pantry/pantry';
import { recipeDetailPage } from '@/pages/recipe-detail/recipe-detail';
import { recipesPage } from '@/pages/recipes/recipes';
import { footer } from '@/components/footer/footer';
import { header } from '@/components/header/header';

export const routes = [
  {
    path: '/',
    page: withLayout(homePage, { header, footer }),
  },
  {
    path: '/pantry',
    page: withLayout(pantryPage, { header, footer }),
  },
  {
    path: '/recipes',
    page: withLayout(recipesPage, { header, footer }),
  },
  {
    path: '/recipes/:id',
    page: withLayout(recipeDetailPage, { header, footer }),
  },
];
