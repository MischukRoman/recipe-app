const jwt = require("jsonwebtoken");

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

require('dotenv').config({path: 'variables.env'});

const Recipe = require('./models/Recipe');
const User = require('./models/User');

// Bring in GraphQl-Express middleware
const {graphiqlExpress, graphqlExpress} = require('apollo-server-express');
const {makeExecutableSchema} = require('graphql-tools');

const {typeDefs} = require('./schema');
const {resolvers} = require('./resolvers');

// Create schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

// Connects to database
mongoose
    .connect(process.env.DATABASE_CLOUD, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB Connected'))
    .catch(err => console.log(err));

// Initializes application
const app = express();

// cors
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
};
app.use(cors(corsOptions));

// Set up JWT authentication middleware
app.use(async (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('token: ', token);
    if (token !== "null") {
        try {
            const currentUser = await jwt.verify(token, process.env.SECRET);
            req.currentUser = currentUser;
        } catch (err) {
            console.error(err)
        }
    }
    next();
});

// Create GraphQl application
/*app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));*/

// Connect schema with GraphQl
app.use('/graphql',
    bodyParser.json(),
    graphqlExpress(({currentUser}) => ({
        schema,
        context: {
            Recipe,
            User,
            currentUser
        }
    })));

if(process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});