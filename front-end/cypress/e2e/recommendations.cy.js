import dotenv from "dotenv";

dotenv.config();

beforeEach(() => {
    cy.resetDatabase();
});

describe("Route /", () => {
    it("Should return the last ten recommendations", () => {
        cy.seedDatabase();
        cy.visit(`http://localhost:3000/`);

        cy.intercept("GET", "http://localhost:5000/recommendations").as("recommendations");

        cy.request("GET", "http://localhost:5000/recommendations");

        cy.wait("@recommendations").then((interception) => {
            expect(interception.response.body.length).to.be.below(11);
            expect(interception.response.statusCode).to.equal(200);
        });
    });

    it("Should insert a new recommendation", () => {
        cy.seedDatabase();
        cy.visit(`http://localhost:3000/`);

        cy.get("[data-test-id='name']").type("Example");
        cy.get("[data-test-id='url']").type("https://www.youtube.com/watch?v=oxWEVQP5_Rg&t=1004s");

        cy.intercept("POST", "http://localhost:5000/recommendations").as("new-recommendation");

        cy.get("[data-test-id='submit']").click();

        cy.wait("@new-recommendation").then((interception) => {
            expect(interception.response.statusCode).to.equal(201);
        });
    });

    it("Should return a conflict error on insert a duplicated recommendation", () => {
        cy.seedDatabase();
        cy.visit(`http://localhost:3000/`);

        cy.get("[data-test-id='name']").type("Example");
        cy.get("[data-test-id='url']").type("https://www.youtube.com/watch?v=oxWEVQP5_Rg&t=1004s");

        cy.intercept("POST", "http://localhost:5000/recommendations").as("new-recommendation");

        cy.get("[data-test-id='submit']").click();

        cy.get("[data-test-id='name']").type("Example");
        cy.get("[data-test-id='url']").type("https://www.youtube.com/watch?v=oxWEVQP5_Rg&t=1004s");

        cy.intercept("POST", "http://localhost:5000/recommendations").as("duplicated-recommendation");

        cy.get("[data-test-id='submit']").click();

        cy.wait("@new-recommendation").then((interception) => {
            expect(interception.response.statusCode).to.equal(201);
        });
        cy.wait("@duplicated-recommendation").then((interception) => {
            expect(interception.response.statusCode).to.equal(409);
        });
    });
});

describe("Route /top", () => {
    it("Should return the recommendations order by score", () => {
        cy.seedDatabase();
        cy.visit(`http://localhost:3000/top`);

        cy.intercept("GET", "http://localhost:5000/recommendations/top/10").as("recommendations");

        cy.request("GET", "http://localhost:5000/recommendations/top/10");

        cy.wait("@recommendations").then((interception) => {
            expect(interception.response.body.length).to.be.below(11);
            expect(interception.response.statusCode).to.be.eq(200);
            expect(interception.response.body[1].score).to.not.be.gt(interception.response.body[0].score);
        });
    });
});

describe("Route /random", () => {
    it("Should return a random recommendation", () => {
        cy.seedDatabase();
        cy.visit(`http://localhost:3000/random`);

        cy.intercept("GET", "http://localhost:5000/recommendations/random").as("recommendation");

        cy.request("GET", "http://localhost:5000/recommendations/random");

        cy.wait("@recommendation").then((interception) => {
            expect(interception.response.body).to.be.a("object");
            expect(interception.response.statusCode).to.equal(200);
        });
    });
});

describe("Route /:id/downvote", () => {
    it("Shoul a downvote a recommendation", () => {
        let id;
        cy.seedDatabase();
        cy.visit(`http://localhost:3000/`);

        cy.intercept("GET", "http://localhost:5000/recommendations").as("recommendations");

        cy.request("GET", "http://localhost:5000/recommendations/");

        cy.wait("@recommendations").then(({ response }) => {
            id = response.body[0].id;

            cy.intercept("POST", `http://localhost:5000/recommendations/${id}/downvote`).as("downvote");

            cy.get(`[data-test-id='${"down " + id}']`).click();

            cy.request("POST", `http://localhost:5000/recommendations/${id}/downvote`);

            cy.wait("@downvote", { timeout: 30000 }).then((interception) => {
                console.log(interception);
                expect(interception.response.statusCode).to.equal(200);
            });
        });
    });
});

describe("Route /:id/upvote", () => {
    it("Shoul a upvote a recommendation", () => {
        let id;
        cy.seedDatabase();
        cy.visit(`http://localhost:3000/`);

        cy.intercept("GET", "http://localhost:5000/recommendations").as("recommendations");

        cy.request("GET", "http://localhost:5000/recommendations/");

        cy.wait("@recommendations").then(({ response }) => {
            id = response.body[0].id;

            cy.intercept("POST", `http://localhost:5000/recommendations/${id}/upvote`).as("upvote");

            cy.get(`[data-test-id='${"up " + id}']`).click();

            cy.request("POST", `http://localhost:5000/recommendations/${id}/upvote`);

            cy.wait("@upvote", { timeout: 30000 }).then((interception) => {
                console.log(interception);
                expect(interception.response.statusCode).to.equal(200);
            });
        });
    });
});

