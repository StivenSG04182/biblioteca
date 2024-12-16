import { trackVisits } from './trackVisits.js';

export const setupMiddleware = (app) => {
  app.use(trackVisits);
};