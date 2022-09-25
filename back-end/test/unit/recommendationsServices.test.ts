import supertest from "supertest";
import { prisma } from "../../src/database";

import * as recommendationService from "../../src/services/recommendationsService"

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;
});

describe("Test insert function", () => {
    it("Should return status 200 and 10 latest recommendations", async () => {

        const promise = await agent.get("/recommendations").send();

        expect(promise.status).toBe(200);
    });
});


afterAll(async () => {
    await prisma.$disconnect()
})