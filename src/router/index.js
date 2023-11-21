import UserRouter from '../router/UserRouter.js';

const routes = (app) => {
  app.use('/api/user', UserRouter);

  app.get('/', (req, res) => {
    res.json({ name: 'Hi LofA' });
  });
};

export default routes;
