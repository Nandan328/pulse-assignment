const validateMiddleware = (req, res, next) => {
  const { companyname, startDate, endDate, source } = req.body;

  if (!companyname || !startDate || !endDate || !source) {
    return res.status(400).json({
      success: false,
      message: "companyname, startDate, endDate, and source are required",
    });
  }

  const validSources = ["G2", "Capterra", "Trustradius"];
  if (!validSources.includes(source)) {
    return res.status(400).json({
      success: false,
      message: "source must be either G2, Capterra or Trustradius",
    });
  }

  next();
};

module.exports = validateMiddleware;
