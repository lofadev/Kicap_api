import SliderRouter from '../routes/SliderRouter.js';
import UserRouter from '../routes/UserRouter.js';
import ProductRouter from '../routes/ProductRouter.js';
import ShipperRouter from '../routes/ShipperRouter.js';

const routes = (app) => {
  app.use('/api/user', UserRouter);
  app.use('/api/slider', SliderRouter);
  app.use('/api/product', ProductRouter);
  app.use('/api/shipper', ShipperRouter);

  app.get('/', (req, res) => {
    res.json({ name: 'Hi LofA' });
  });
};

export default routes;
