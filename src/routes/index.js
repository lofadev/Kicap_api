import SliderRouter from '../routes/SliderRouter.js';
import UserRouter from '../routes/UserRouter.js';

const routes = (app) => {
  app.use('/api/user', UserRouter);
  app.use('/api/slider', SliderRouter);

  app.get('/', (req, res) => {
    res.json({ name: 'Hi LofA' });
  });
};

export default routes;
