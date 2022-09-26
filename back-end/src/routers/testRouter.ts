import { Router } from "express";
import { resetController } from "../controllers/testController.js";

const testRouter = Router();

testRouter.post("/reset", resetController);

export default testRouter;