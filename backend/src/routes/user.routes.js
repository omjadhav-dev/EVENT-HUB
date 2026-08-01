import { Router } from "express";
import {loginUser, logoutUser, registerUser} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

const userRouter = Router();

userRouter.route("/register").post(upload.none(), registerUser)
userRouter.route("/login").post(loginUser)

userRouter.route("/logout").post(verifyJWT, logoutUser)

export default userRouter;