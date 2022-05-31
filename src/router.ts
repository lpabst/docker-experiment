import express from "express";
import userController from "./controllers/userController";
import authController from "./controllers/authController";
import shopController from "./controllers/shopController";
import productController from "./controllers/productController";

const router = express.Router();

router.get("/health", (req, res, next) => {
  return res.status(200).send("ok");
});

router.use(userController);
router.use(authController);
router.use(shopController);
router.use(productController);

export default router;
