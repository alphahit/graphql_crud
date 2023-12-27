import { ApolloServer } from "@apollo/server";
// This line imports the ApolloServer class from the @apollo/server package.
// The ApolloServer class is used to create an instance of an Apollo Server.
// This server will process GraphQL requests and return responses.
import { connect, getDb } from "./db.js";
import { startStandaloneServer } from "@apollo/server/standalone";
// This line imports the startStandaloneServer function from the @apollo/server/standalone package.
// This function is used to start a standalone Apollo Server without needing to integrate
// it into an existing web server framework like Express.js.
import { ObjectId } from "mongodb";
import { typeDefs } from "./schema.js";

const resolvers = {
    //Here we will make resolver functions for each diffrernt type that we defined
    //We want to make resolver functions for every field defined in the root Query type

    //Resolver definitions in a GraphQL server
    //This should match exactly with the type name
    Query: {
        //This resolver corresponds to the games query in your GraphQL schema.
        //When a client queries for games, this resolver is called.
        async games() {
            // Retrieve the MongoDB database instance using the 'getDb' function.
            // 'getDb' is imported from 'db.js' and returns a reference to the MongoDB database.
            const db = getDb();

            // Access the 'games' collection within the MongoDB database.
            // Collections in MongoDB are like tables in relational databases.
            const gamesCollection = db.collection("games");

            // Perform a 'find' operation on the 'gamesCollection'.
            // 'find({})' retrieves all documents from the collection without any filter.
            // 'toArray()' converts the result to an array of objects.
            // Since 'find' returns a cursor, 'toArray()' is used to fetch all documents pointed to by the cursor.
            const games = await gamesCollection.find({}).toArray();
            console.log("Games returned=====>",games)
            // Map over each game and rename '_id' to 'id'.
            return games.map((game) => ({
                ...game,
                id: game._id.toString(), // Convert MongoDB ObjectId to a string and rename to 'id'.
            }));
        },

        async game(_, args) {
            const db = getDb();
            const gamesCollection = db.collection("games");
            const game = await gamesCollection.findOne({
                _id: new ObjectId(args.id),
            });
            return game ? { ...game, id: game._id.toString() } : null;
        },
        // Assuming you have authors and reviews collections in your MongoDB
        // If not, you need to adjust these resolvers accordingly.
        async authors() {
            const db = getDb();
            const authorsCollection = db.collection("authors");
            const authors = await authorsCollection.find({}).toArray();
            return authors.map((author) => ({
                ...author,
                id: author._id.toString(),
            }));
        },

        async author(_, args) {
            const db = getDb();
            const authorsCollection = db.collection("authors");
            const author = await authorsCollection.findOne({
                _id: new ObjectId(args.id),
            });
            return author ? { ...author, id: author._id.toString() } : null;
        },

        async reviews() {
            const db = getDb();
            const reviewsCollection = db.collection("reviews");
            const reviews = await reviewsCollection.find({}).toArray();
            return reviews.map((review) => ({
                ...review,
                id: review._id.toString(),
            }));
        },

        async review(_, args) {
            const db = getDb();
            const reviewsCollection = db.collection("reviews");
            const review = await reviewsCollection.findOne({
                _id: new ObjectId(args.id),
            });
            return review ? { ...review, id: review._id.toString() } : null;
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
            const db = getDb();
            const reviewsCollection = db.collection("reviews");
            // Assuming a 'game_id' field in the reviews collection that references a game's '_id'
            return reviewsCollection.find({ game_id: parent._id }).toArray();
        },
    },

    Author: {
        reviews(parent) {
            const db = getDb();
            const reviewsCollection = db.collection("reviews");
            // Assuming an 'author_id' field in the reviews collection that references an author's '_id'
            return reviewsCollection.find({ author_id: parent._id }).toArray();
        },
    },

    Review: {
        async author(parent) {
            const db = getDb();
            const authorsCollection = db.collection("authors");
            const author = await authorsCollection.findOne({ _id: parent.author_id });
            return author ? { ...author, id: author._id.toString() } : null;
        },
        async game(parent) {
            const db = getDb();
            const gamesCollection = db.collection("games");
            const game = await gamesCollection.findOne({ _id: parent.game_id });
            return game ? { ...game, id: game._id.toString() } : null;
        },
    }
    ,
    Mutation: {
        //Mutation Resolvers
        deleteGame: async (_, args) => {
            const db = getDb();
            const gamesCollection = db.collection("games");

            // Convert the provided 'id' to a MongoDB ObjectId.
            // This assumes 'args.id' is a string representing a valid MongoDB ObjectId.
            const objectId = new ObjectId(args.id);

            // Correct placement of console.log to log the objectId after it's been initialized
            console.log("objectId ======<>", objectId);

            const gameToDelete = await gamesCollection.findOne({
                _id: objectId,
            });
            if (!gameToDelete) {
                throw new Error(`Game with id ${args.id} not found`);
            }

            // Attempt to delete the game with the specified id.
            const result = await gamesCollection.deleteOne({ _id: objectId });

            // Check if a document was actually deleted.
            if (result.deletedCount === 1) {
                // The game was successfully deleted.
                // Return the data of the deleted game.
                return {
                    id: args.id,
                    title: gameToDelete.title,
                    platform: gameToDelete.platform,
                };
            } else {
                // No document was deleted (possibly because it didn't exist).
                // Handle this case appropriately, possibly by throwing an error or returning null.
                throw new Error(`Could not delete game with id ${args.id}`);
            }
        },

        addGame: async (_, args) => {
            // Fetch the MongoDB database instance using the 'getDb' function from 'db.js'.
            const db = getDb();

            // Access the 'games' collection from the MongoDB database.
            const gamesCollection = db.collection("games");

            // Log the 'gamesCollection' object for debugging purposes. This helps to verify that
            // the collection is correctly accessed.
            //console.log("gamesCollection =========>", gamesCollection);

            // Insert a new game document into the 'games' collection. The game data comes from 'args.game',
            // which is provided by the client when making the mutation request. The spread operator '...'
            // is used to unpack the properties of 'args.game' into the new document.
            const result = await gamesCollection.insertOne({ ...args.game });

            // Log the result of the insert operation for debugging. This will show whether the insert was successful
            // and other details about the operation.
            //console.log("result======>", result);

            // Check if the insert operation was acknowledged by MongoDB. If it was, the operation was successful.
            if (result.acknowledged) {
                // Return the newly added game data. 'result.insertedId' contains the ID of the newly inserted game.
                // The rest of the game data is returned as is from 'args.game'.
                return { id: result.insertedId, ...args.game };
            } else {
                // If the insert operation was not acknowledged, throw an error indicating the insertion failed.
                throw new Error("Game insertion failed");
            }
        },
        updateGame: async (_, args) => {
            const db = getDb();
            const gamesCollection = db.collection("games");

            // Convert the provided 'id' to a MongoDB ObjectId.
            const objectId = new ObjectId(args.id);

            // Attempt to update the game with the specified id.
            const result = await gamesCollection.findOneAndUpdate(
                { _id: objectId },
                { $set: args.edits },
                { returnDocument: "after" } // This option specifies that the updated document should be returned.
            );

            // Check if a document was actually updated and returned.
            if (result.value) {
                // The game was successfully updated.
                // Return the updated game data, ensuring to convert '_id' to 'id'.
                return {
                    ...result.value,
                    id: result.value._id.toString(),
                };
            } else {
                // No document was updated (possibly because it didn't exist).
                // Handle this case appropriately, possibly by throwing an error or returning null.
                throw new Error(`Game with id ${args.id} not found`);
            }
        },
        addAuthor: async (_, args) => {
            const db = getDb();
            const authorsCollection = db.collection('authors');
            const result = await authorsCollection.insertOne(({ ...args.author }));
            if(result.acknowledged) {
                return { id: result.insertedId, ...args.author };
            }else{
                throw new Error("Author insertion failed");
            }

        },
        addReview: async (_, args) => {
            const db = getDb();
            const reviewsCollection = db.collection('reviews');
            const gamesCollection = db.collection('games');
            const authorsCollection = db.collection('authors');
        
            const gameId = new ObjectId(args.review.game_id);
            const authorId = new ObjectId(args.review.author_id);
        
            const gameExists = await gamesCollection.findOne({ _id: gameId });
            const authorExists = await authorsCollection.findOne({ _id: authorId });
        
            if (!gameExists || !authorExists) {
                throw new Error("Game or Author not found");
            }
        
            const result = await reviewsCollection.insertOne({
                rating: args.review.rating,
                content: args.review.content,
                game_id: gameId,
                author_id: authorId
            });
        
            if (result.acknowledged) {
                console.log("It is acknowledged")
                return {
                    id: result.insertedId.toString(),
                    rating: args.review.rating,
                    content: args.review.content,
                    game: gameExists, // Ensure this is not null
                    author: authorExists // Ensure this is not null
                };
            } else {
                throw new Error("Review insertion failed");
            }
        }
        
    },
};

async function startServer() {
    try {
        await connect(); // Connect to MongoDB
        const server = new ApolloServer({
            typeDefs,
            resolvers,
        });
        const { url } = await startStandaloneServer(server, {
            listen: { port: 4000 },
        });
        console.log(`Server Ready at ${url}`);
    } catch (error) {
        console.error("Error starting server:", error);
    }
}
startServer();
console.log("Server Ready at port", 4000);
