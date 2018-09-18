const { ApolloServer, AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });

const User = require('./models/User');
const Post = require('./models/Post');
const resolvers = require('./resolvers');

const filePath = path.join(__dirname, 'typeDefs.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');

mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true }
  )
  .then(() => console.log('DB connected'))
  .catch(err => console.error(err));

const getUser = async token => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (err) {
      throw new AuthenticationError(
        'Your session has ended. Please sign in again.'
      );
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: error => {
    return {
      name: error.name,
      message: error.message.replace('Context creation failed:', '')
    };
  },
  context: async ({ req }) => {
    const token = req.headers['authorization'] || null;
    const currentUser = await getUser(token);
    return { User, Post, currentUser };
  }
});

server.listen().then(({ url }) => console.log(`Server listening on ${url}`));
