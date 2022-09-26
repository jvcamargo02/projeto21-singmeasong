import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database.js";

export async function fakeRecommendation() {
    return {
        name: faker.internet.userName(),
        youtubeLink: "https://www.youtube.com/watch?v=-YiJ0SG4j_U",
    };
}

export async function createRecommendationWithRandomScore() {
    let recommendationData = [];

    for (let i = 0; i < 10; i++) {
        const recommendation = await fakeRecommendation();
        recommendationData.push({ ...recommendation, score: +faker.random.numeric(2) });
    }

    await prisma.recommendation.createMany({
        data: recommendationData,
    });

    return recommendationData;
}


export async function createManyRecomendations(quantity: number) {
    let recommendationData = [];

    for (let i = 0; i < quantity + 1; i++) {
        recommendationData.push(await fakeRecommendation());
    }

    await prisma.recommendation.createMany({
        data: recommendationData,
    });

    const allRecommendation = await prisma.recommendation.findMany({});
    const expectedReturn = allRecommendation.slice(-10);
    return { allRecommendation, expectedReturn, recommendationData };
}