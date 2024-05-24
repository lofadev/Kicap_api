import DashboardService from '../services/DashboardService.js';
import variable from '../variable.js';

const getDashBoard = async (req, res) => {
  try {
    const response = await DashboardService.getDashBoard();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getRevenue = async (req, res) => {
  try {
    let { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    month = Number(month);
    year = Number(year);
    const fromDate = new Date(year, month - 1, 1);
    // const toDate = new Date(year, month + 1, 10);
    // console.log(toDate);
    // const params = { month, year };
    // const response = await DashboardService.getRevenue(params);
    return res.status(200).json({});
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const DashboardController = { getDashBoard, getRevenue };
export default DashboardController;
