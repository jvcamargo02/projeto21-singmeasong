# <p align = "center"> Projeto Sing me a Song</p>

<p align="center">
   <img src="https://static.wixstatic.com/media/231850_ae0e6de641634affabc2836ecd943342~mv2.gif" height=150/>
</p>

<p align = "center">
   <img src="https://img.shields.io/badge/author-jvcamargo02-4dae71?style=flat-square" />
   <img src="https://img.shields.io/github/languages/count/jvcamargo02/projeto21-singmeasong?color=4dae71&style=flat-square" />
</p>


##  :clipboard: Description

It is a project developed for the purpose of testing. All service layers have a set of unit tests with 100% coverage, testing all possible cases. Furthermore, integrated tests and E2E were implemented. With it, you can publish a video recommendation and vote on existing recommendations. You can vote more than once for each recommendation. If the recommendation accumulates more than -5 downvotes, it is automatically excluded from the list. Recommendations are ordered randomly by default, but the user can choose to sort by the number of upvotes. The application also offers the possibility to randomly choose a recommendation.

***

## :computer:	 Technologies and applied knowledge

- REST APIs
- Node.js
- TypeScript
- React
- Jest
- Cypress


***

## :rocket: Routes

```yml
POST /recommendations
    - Route to create a new recommendation
    - headers: {}
    - body:{
        "name": "loremipsum",
        "youtubeLink": "https://www.youtube.com/"
    }
```
    
```yml 
POST /recommendations/:id/upvote
    - Route to like a recommendation
    - headers: {}
    - body: {}
```

```yml 
POST /recommendations/:id/downvote
    - Route to deslike a recommendation
    - headers: {}
    - body: {}
```
    
```yml 
GET /recommendations
    - Route to list all recommendations ordered by default
    - headers: {}
    - body: {}
```

```yml
GET /recommendations/:id
    - Route to return a specific recommendation
    - headers: {}
    - body: {}
``` 

```yml
GET /recommendations/random
    - Route to choosen a random recommendation
    - headers: {}
    - body: {}
``` 

```yml
GET /recommendations/top/:amount
    - Route to list a quantity specific of recommendations
    - headers: {}
    - body: {}
``` 

***

## 🏁 How to run

Make sure you have the latest stable version of [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) running locally.

First step: clone this project

```
git clone https://github.com/jvcamargo02/projeto21-singmeasong.git
```

Second step: inside the project folder, run the command ( :warning: repeat for frontend and backend folder :warning: )

```
npm install
```

Third Step: Create an .env file inside the project folder following the example ( :warning: repeat for frontend and backend folder :warning: )
```
//.env > back-end
DATABASE_URL="<postgresql://USER:PASSWORD@HOST:PORT/DATABASE>"

//.env > front-end
REACT_APP_API_BASE_URL="http://localhost:5000"
```

Finally, start the application with the command: ( :warning: repeat for frontend and backend folder :warning: )
```
npm start
```

## 🏁 How to run test cases

First step: after following the steps above, run: ( :warning: repeat for frontend and backend folder :warning: )

```
npm run test
```