import { Router, type IRouter } from "express";
import healthRouter from "./health";
import drugsRouter from "./drugs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(drugsRouter);

export default router;
