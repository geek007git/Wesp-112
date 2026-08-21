const userModel = require("../models/userModels");

// runs after authMiddleware
module.exports = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .send({ message: "Admins only", success: false });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Auth check failed", success: false });
  }
};
