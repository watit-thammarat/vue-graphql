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
      const totalDocs = await Post.count({});
      const hasMore = totalDocs > pageSize * pageNum;
      return { posts, hasMore };
    },
    getPost: async (_, { id }, { Post }) => {
      const post = await Post.findOne({ _id: id })
        .populate({
          path: 'messages.messageUser',
          model: 'User'
        })
        .populate({ path: 'createdBy', model: 'User' });
      return post;
    },
    searchPosts: async (_, { searchTerm }, { Post }) => {
      if (searchTerm) {
        const searchResult = await Post.find(
          { $text: { $search: searchTerm } },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' }, likes: 'desc' })
          .limit(5);
        return searchResult;
      }
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
    },
    addPostMessage: async (_, { messageBody, userId, postId }, { Post }) => {
      const message = {
        messageBody,
        messageUser: userId
      };
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { messages: { $each: [message], $position: 0 } } },
        { new: true }
      ).populate({
        path: 'messages.messageUser',
        model: 'User'
      });
      return post.messages[0];
    },
    likePost: async (_, { postId, username }, { Post, User }) => {
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      );
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      });
      return { likes: post.likes, favorites: user.favorites };
    },
    unlikePost: async (_, { postId, username }, { Post, User }) => {
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: -1 } },
        { new: true }
      );
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      });
      return { likes: post.likes, favorites: user.favorites };
    }
  }
};
