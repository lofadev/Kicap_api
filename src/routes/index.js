import SliderRouter from '../routes/SliderRouter.js';
import UserRouter from '../routes/UserRouter.js';
import ProductRouter from '../routes/ProductRouter.js';
import ShipperRouter from '../routes/ShipperRouter.js';
import SupplierRouter from '../routes/SupplierRouter.js';
import ProvinceRouter from '../routes/ProvinceRouter.js';
import CategoryRouter from '../routes/CategoryRouter.js';

const routes = (app) => {
  app.use('/api/user', UserRouter);
  app.use('/api/slider', SliderRouter);
  app.use('/api/product', ProductRouter);
  app.use('/api/shipper', ShipperRouter);
  app.use('/api/supplier', SupplierRouter);
  app.use('/api/province', ProvinceRouter);
  app.use('/api/category', CategoryRouter);

  app.get('/', (req, res) => {
    res.json({ name: 'Hi LofA' });
  });
};

export default routes;
