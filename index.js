import { ApolloServer } from "@apollo/server";
// This line imports the ApolloServer class from the @apollo/server package.
// The ApolloServer class is used to create an instance of an Apollo Server.
// This server will process GraphQL requests and return responses.

import { startStandaloneServer } from "@apollo/server/standalone";
// This line imports the startStandaloneServer function from the @apollo/server/standalone package.
// This function is used to start a standalone Apollo Server without needing to integrate
// it into an existing web server framework like Express.js.

import { typeDefs } from "./schema.js";

//Databse
import db from "./_db.js";

const resolvers = {
    //Here we will make resolver functions for each diffrernt type that we defined
    //We want to make resolver functions for every field defined in the root Query type

    //Resolver definitions in a GraphQL server
    //This should match exactly with the type name
    Query: {
        //This resolver corresponds to the games query in your GraphQL schema.
        //When a client queries for games, this resolver is called.
        games() {
            return db.games;
        },
        game(_, args) {
            return db.games.find((game) => game.id === args.id);
        },

        //This resolver handles queries for authors.
        authors() {
            return db.authors;
        },
        author(_, args) {
            return db.authors.find((author) => author.id === args.id);
        },

        //This resolver is for the reviews query.
        reviews() {
            return db.reviews;
        },
        review(_, args) {
            return db.reviews.find((review) => review.id === args.id);
        },
    },

    //This is for related data
    //Working: Because entry point for Apollo will be a single game it will run that initial resolver funtion
    //game(_,args) inside the query object to get that single game and then to resolve reviews for that game it's going to
    //resolve the reviews for that game it's going to look to the Game object and then it's going to look for the
    //reviews resolver inside that to grab the reviews

    //How do we now what game we are getting reviews for ?
    //We can access the ID of the game via the parent argument because the parent argumentis a reference to the value returned
    //or parent resolver and now in our case that's going to be the game one so the initial one inside the query object
    //so this parent argument will basically be a game object and that gae object will have an id and we can use the id now to return all
    //the reviews associated with that game id.
    Game: {
        reviews(parent) {
            //Here parent is the game object
            return db.reviews.filter((review) => review.game_id === parent.id);
        },
    },
    Author: {
        reviews(parent) {
            //Here parent is the game object
            return db.reviews.filter(
                (review) => review.author_id === parent.id
            );
        },
    },
    Review: {
        author(parent) {
            //Here review object is the parent
            return db.authors.find((author) => author.id === parent.author_id);
        },
        game(parent) {
            return db.games.find((game) => game.id === parent.game_id);
        },
    },
    Mutation:{
        deleteGame(_,args) {
            db.games = db.games.filter((game)=> game.id !== args.id);
            return db.games
        },
        addGame(_,args) {
            let game = {
                ...args.game,
                id:Math.floor(Math.random()*10000).toString()
            }
            db.games.push(game);
            return game
        },
        updateGame(_,args) {
            db.games = db.games.map((game)=>{
               if(game.id === args.id) {
                return {...game, ...args.edits}
               }
               return game
            })
            return db.games.find((game)=>game.id === args.id)
        }
    }
};

//Server Setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log("Server Ready at port", 4000);
