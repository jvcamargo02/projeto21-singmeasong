import { faker } from "@faker-js/faker";
import youtubeRandom from "random-youtube-music-video";

export async function fakeRecommendation() {
    return {
        name: faker.internet.userName(),
        youtubeLink: "https://www.youtube.com/watch?v=-YiJ0SG4j_U",
    };
}


