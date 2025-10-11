import { createHistoryRouter } from '@/core/router';
import { notFoundPage } from '@/pages/not-found/not-found';
import { routes } from '@/config/routes';
import '@/style.css';

createHistoryRouter({
  root: document.getElementById('app'),
  routes,
  notFound: notFoundPage,
});
