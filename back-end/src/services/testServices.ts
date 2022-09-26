import * as testRepository from "../repositories/testRepository.js"
import * as recommendationFactory from "../../test/factories/recommendationsFactory.js"



export async function resetDatabase() {
    return await testRepository.deleteAll()
}

export async function seedDatabase() {
    return await recommendationFactory.createRecommendationWithRandomScore()



}