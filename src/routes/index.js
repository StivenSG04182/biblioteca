import authRoutes from './auth.js';
import questionRoutes from './questions.js';
import chatRoutes from './chats.js';
import settingsRoutes from './settings.js';
import statsRoutes from './stats.js';
import userRoutes from './users.js';

export const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/chats', chatRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/users', userRoutes);
};