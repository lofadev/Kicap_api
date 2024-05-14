const createOrder = (req, res) => {
  try {
    res.status(200).json('create router');
  } catch (error) {
    console.log(error);
  }
};

const OrderController = {
  createOrder,
};

export default OrderController;
