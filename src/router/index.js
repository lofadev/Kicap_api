import productRouter from './product.js';

const routes = (app) => {
  app.use('/product', productRouter);
  app.use('/', (req, res) => {
    res.send('home page');
  });
};

export default routes;
