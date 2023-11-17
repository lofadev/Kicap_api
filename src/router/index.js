const UserRouter = require('../router/UserRouter');

const routes = (app) => {
  app.use('/api/user', UserRouter);

  app.get('/', (req, res) => {
    res.json({ name: 'Hi LofA' });
  });
};

module.exports = routes;
