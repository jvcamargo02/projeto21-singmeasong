import { Request, Response } from "express"

import * as testServices from "../services/testServices.js"

export async function resetDatabase(req: Request, res: Response) {
    
    await testServices.resetDatabase()

    res.sendStatus(200)
}

export async function seedDatabase(req:Request, res: Response) {
    
    await testServices.seedDatabase()

    res.sendStatus(201)
}