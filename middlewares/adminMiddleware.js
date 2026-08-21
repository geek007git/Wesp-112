const userModel = require("../models/userModels");

// runs after authMiddleware
module.exports = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId).select("isAdmin");
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .send({ success: false, message: "Admin access required" });
    }
    next();
  } catch (error) {
    next(error);
  }
};
