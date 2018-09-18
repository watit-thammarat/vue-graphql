const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = ({ username, email }, secret, expiresIn) => {
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find({})
        .sort({ createdDate: 'desc' })
        .populate({ path: 'createdBy', model: 'User' });
      return posts;
    },
    getCurrentUser: async (_, args, { currentUser, User }) => {
      if (!currentUser) {
        return null;
      }
      const user = await User.findOne({
        username: currentUser.username
      }).populate({
        path: 'favorites',
        model: 'Post'
      });
      return user;
    },
    infiniteScrollPosts: async (_, { pageNum, pageSize }, { Post }) => {
      let skips = pageNum === 1 ? 0 : pageSize * (pageNum - 1);
      const posts = await Post.find({})
        .sort({ createdDate: 'desc' })
        .populate({
          path: 'createdBy',
          model: 'User'
        })
        .skip(skips)
        .limit(pageSize);
      const totalDocs = await Post.countDucuments;
      const hasMore = totalDocs > pageSize * pageNum;
      return { posts, hasMore };
    }
  },
  Mutation: {
    addPost: async (
      _,
      { title, imageUrl, categories, description, creatorId },
      { Post }
    ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save();
      return newPost;
    },
    signupUser: async (_, { username, email, password }, { User }) => {
      let user = await User.findOne({ username });
      if (user) {
        throw new Error('User already exists');
      }
      user = await new User({ username, email, password }).save();
      return { token: createToken(user, process.env.SECRET, '1hr') };
    },
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      return { token: createToken(user, process.env.SECRET, '1hr') };
    }
  }
};
