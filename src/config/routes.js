import { withLayout } from '../core/with-layout';
import { homePage } from '../pages/home/home';

export const routes = [{ path: '/', page: withLayout(homePage) }];
