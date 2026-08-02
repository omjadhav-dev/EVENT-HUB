import { Router } from "express";
import {upload} from "../middlewares/multer.js"
import {createEvent} from "../controllers/event.controllers.js";

const eventRouter = Router();

eventRouter.route("/create").post(upload.fields([
    {
        name: "coverImage",
        maxCount: 1
    }
]), createEvent)

export default eventRouter;