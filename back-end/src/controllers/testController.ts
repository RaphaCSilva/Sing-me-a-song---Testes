import { Request, Response } from "express";
import { resetDatabase } from "../services/testService.js";

export async function resetController(req: Request, res: Response) {
    await resetDatabase();
    res.sendStatus(200);        
}