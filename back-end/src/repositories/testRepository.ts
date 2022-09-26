import { prisma } from "../database.js";
import { CreateRecommendationData } from "../services/recommendationsService.js";

export async function deleteAll() {
    await prisma.recommendation.deleteMany({})
}

export async function insertRecommendations(recommedationsData:CreateRecommendationData[]) {
    await prisma.recommendation.createMany({
        data: recommedationsData
    })
}