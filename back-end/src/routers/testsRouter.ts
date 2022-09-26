import { Router } from "express";

import * as testsController from "../controllers/testController.js"

const testRouter = Router();

testRouter.post("/reset-database", testsController.resetDatabase);
testRouter.post("/seed/recommendations", testsController.seedDatabase);

export default testRouter;
