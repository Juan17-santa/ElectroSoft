import { Router } from "express";
import authRoutes from "./authRoutes.js";
import usersRoutes from "./usersRoutes.js";
import rolesRoutes from "./rolesRoutes.js";
import clientsRoutes from "./clientsRoutes.js";
import productCategoriesRoutes from "./productCategoriesRoutes.js";
import productCharacteristicsRoutes from "./productCharacteristicsRoutes.js";
import productMeasuresRoutes from "./productMeasuresRoutes.js";
import productsRoutes from "./productsRoutes.js";
import providersRoutes from "./providersRoutes.js";
import shoppingRoutes from "./shoppingRoutes.js";
import salesRoutes from "./salesRoutes.js";
import ordersRoutes from "./ordersRoutes.js";
import devolutionsRoutes from "./devolutionsRoutes.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use("/auth", authRoutes);

router.use(requireAuth);
router.use("/users", usersRoutes);
router.use("/roles", rolesRoutes);
router.use("/clients", clientsRoutes);
router.use("/product-categories", productCategoriesRoutes);
router.use("/product-characteristics", productCharacteristicsRoutes);
router.use("/product-measures", productMeasuresRoutes);
router.use("/products", productsRoutes);
router.use("/providers", providersRoutes);
router.use("/shopping", shoppingRoutes);
router.use("/sales", salesRoutes);
router.use("/orders", ordersRoutes);
router.use("/devolutions", devolutionsRoutes);

export default router;
