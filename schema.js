export const typeDefs = `#graphql



#Game Type
# This "Game" type defines the queryable fields for every book in our data source.
#type Game { ... }: This defines a Game type with several fields. Each field has a type, 
#and some have additional annotations like !, which denotes that the field is non-nullable (cannot be null).
#id: ID!: A unique identifier for each Game, which is a non-nullable ID type.
#title: String!: The title of the game, a non-nullable String.
#latform: [String!]!: A non-nullable array of non-nullable strings, representing the platforms the game is available on.
#reviews:[Review!]: An array of Review types. This can be null, but if present, 
#all items in the array must be of type Review and cannot be null.
type Game {
    id: ID! #The ! mark mean this is not allowed to be null
    title: String!
    platform: [String!]! #This array mark implies array of strings
    reviews:[Review!] #It is [Review!] an not [Review!]! because, the game might not have any reviews but if it has any review it should be of type review
}




#Review Type
#type Review { ... }: Defines the Review type.
#id: ID!: Unique identifier for the review.
#rating: Int!: A non-nullable integer representing the review rating.
#content: String!: The content of the review.
#game: Game!: The game associated with the review. This is a non-nullable Game type.
#author: Author!: The author of the review, of non-nullable Author type.
type Review {
    id:ID!
    rating: Int!
    content: String!
    game: Game!
    author: Author!
}



#Author Type
#type Author { ... }: Defines the Author type.
#id: ID!: Unique identifier for the author.
#name: String!: The name of the author.
#verified: Boolean!: A boolean indicating whether the author is verified.
#reviews: [Review!]: An array of Review types. Unlike Game, it's okay for this to be null, 
#but if it's not null, all elements must be non-nullable Review objects.
type Author {
    id: ID!
    name: String!
    verified: Boolean!
    reviews: [Review!]
}



#Query Type
#type Query { ... }: Defines the root Query type, which is how clients fetch data. 
#Each field in Query represents a queryable endpoint.
#reviews: [Review]: Returns an array of Review objects, which can be null.
#review(id: ID!): Review: Returns a single Review object based on the provided id.
#games: [Game]: Returns an array of Game objects.
#game(id: ID!): Game: Fetches a single Game based on the id.
#authors: [Author]: Returns an array of Author objects.
#author(id: ID!): Author: Fetches a single Author based on the id.

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "Game" query returns an array of zero or more Games (defined above).

#The Query defines the entry points to the graph and specify the return types of 
#those entry points so for example if I want users to be able to query the review data
#that we have and get back a list of reviews then I need to specify that inside this query type.

type Query{
    reviews: [Review]
    review(id:ID!): Review
    games: [Game]
    game(id:ID!): Game
    authors: [Author]
    author(id:ID!): Author
}

type Mutation{
    addGame(game:AddGameInput!):Game
    deleteGame(id:ID!):Game
    updateGame(id:ID!,edits:EditGameInput!): Game
    addAuthor(author:AddAuthorInput!): Author
    addReview(review:AddReviewInput!): Review
}
input AddGameInput{
    title: String!,
    platform: [String!]!
}

input EditGameInput{
    title: String,
    platform: [String!]
}
input AddAuthorInput{
    name: String!, 
    verified: Boolean!
}
input AddReviewInput{
    rating:Int!
    content:String!
    game_id:ID!
    author_id:ID!
}
`;
