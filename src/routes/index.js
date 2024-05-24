import AttributeRouter from '../routes/AttributeRouter.js';
import CategoryRouter from '../routes/CategoryRouter.js';
import CheckoutRouter from '../routes/CheckoutRouter.js';
import DashboardRouter from '../routes/DashboardRouter.js';
import InventoryRouter from '../routes/InventoryRouter.js';
import OrderRouter from '../routes/OrderRouter.js';
import OrderStatusRouter from '../routes/OrderStatusRouter.js';
import ProductImageRouter from '../routes/ProductImageRouter.js';
import ProductRouter from '../routes/ProductRouter.js';
import ProvinceRouter from '../routes/ProvinceRouter.js';
import ShipperRouter from '../routes/ShipperRouter.js';
import SliderRouter from '../routes/SliderRouter.js';
import SupplierRouter from '../routes/SupplierRouter.js';
import UserRouter from '../routes/UserRouter.js';
import VariantRouter from '../routes/VariantRouter.js';
import OrderDetailRouter from '../routes/OrderDetailRouter.js';

const routes = (app) => {
  app.use('/api/user', UserRouter);
  app.use('/api/slider', SliderRouter);
  app.use('/api/product', ProductRouter);
  app.use('/api/shipper', ShipperRouter);
  app.use('/api/supplier', SupplierRouter);
  app.use('/api/province', ProvinceRouter);
  app.use('/api/category', CategoryRouter);
  app.use('/api/attribute', AttributeRouter);
  app.use('/api/product-image', ProductImageRouter);
  app.use('/api/product-variant', VariantRouter);
  app.use('/api/order-status', OrderStatusRouter);
  app.use('/api/inventory', InventoryRouter);
  app.use('/api/checkout', CheckoutRouter);
  app.use('/api/order', OrderRouter);
  app.use('/api/dashboard', DashboardRouter);
  app.use('/api/order-detail', OrderDetailRouter);

  app.get('/', (req, res) => {
    res.json({ name: 'Hi LofA' });
  });
};

export default routes;
