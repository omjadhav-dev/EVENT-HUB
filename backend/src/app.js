import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({limit: "20kb", extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

// route imports
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";

app.use("/api/v1/users", userRouter)
app.use("/api/v1/events", eventRouter)


export default app;