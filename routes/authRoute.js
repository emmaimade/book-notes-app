import express from "express";
import {
  getHome,
  getRegister,
  getLogin,
  logout,
  register,
  login,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", getHome);
router.get("/auth/register", getRegister);
router.get("/auth/login", getLogin);
router.get("/auth/logout", logout);
router.post("/auth/register", register);
router.post("/auth/login", login);

export default router;
