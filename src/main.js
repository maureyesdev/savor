import './style.css';
import { createHistoryRouter } from './core/router.js';
import { HomePage } from './pages/home.js';

const routes = [{ path: '/', page: HomePage }];

createHistoryRouter({
  root: document.getElementById('app'),
  routes,
});
