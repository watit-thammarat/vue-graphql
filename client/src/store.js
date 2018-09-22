import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as apolloClient } from './main';
import {
  GET_POSTS,
  SIGNIN_USER,
  SIGNUP_USER,
  GET_CURRENT_USER,
  ADD_POST,
  SEARCH_POSTS,
  GET_USER_POSTS,
  UPDATE_USER_POST,
  DELETE_USER_POST,
  INFINITE_SCROLL_POSTS
} from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: null,
    loading: false,
    token: null,
    currentUser: null,
    authError: null,
    searchResults: null,
    userPosts: null
  },
  mutations: {
    setAuthError: (state, payload) => {
      state.authError = payload;
    },
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setLoading: (state, paylaod) => {
      state.loading = paylaod;
    },
    setToken: (state, payload) => {
      state.token = payload;
    },
    setCurrentUser: (state, payload) => {
      state.currentUser = payload;
    },
    removeToken: state => {
      state.token = null;
    },
    removeCurrentUser: state => {
      state.currentUser = null;
    },
    setSearchResults: (state, payload) => {
      if (payload !== null) {
        state.searchResults = payload;
      }
    },
    clearSearchResults: state => {
      state.searchResults = null;
    },
    setUserPosts: (state, payload) => {
      state.userPosts = payload;
    }
  },
  actions: {
    getPosts: async ({ commit }) => {
      const { data } = await apolloClient.query({
        query: GET_POSTS
      });
      commit('setPosts', data.getPosts);
    },
    signinUser: async ({ commit, dispatch }, { username, password }) => {
      localStorage.removeItem('token');
      const { data } = await apolloClient.mutate({
        mutation: SIGNIN_USER,
        variables: {
          username,
          password
        }
      });
      localStorage.setItem('token', data.signinUser.token);
      commit('setToken', data.signinUser.token);
      await dispatch('getCurrentUser');
    },
    signupUser: async ({ commit, dispatch }, { username, email, password }) => {
      localStorage.removeItem('token');
      const { data } = await apolloClient.mutate({
        mutation: SIGNUP_USER,
        variables: {
          username,
          email,
          password
        }
      });
      localStorage.setItem('token', data.signupUser.token);
      commit('setToken', data.signupUser.token);
      await dispatch('getCurrentUser');
    },
    getCurrentUser: async ({ commit }) => {
      const { data } = await apolloClient.query({
        query: GET_CURRENT_USER,
        fetchPolicy: 'network-only'
      });
      commit('setCurrentUser', data.getCurrentUser);
    },
    setCurrentUser: ({ commit }, user) => {
      commit('setCurrentUser', user);
    },
    setToken: ({ commit }) => {
      const token = localStorage.getItem('token') || null;
      commit('setToken', token);
    },
    signoutUser: async ({ commit }) => {
      localStorage.removeItem('token');
      commit('removeToken');
      commit('removeCurrentUser');
      await apolloClient.resetStore();
    },
    addPost: async (
      { commit, getters },
      { title, imageUrl, categories, description }
    ) => {
      const payload = {
        title,
        imageUrl,
        categories,
        description,
        creatorId: getters.user._id
      };
      const { data } = await apolloClient.mutate({
        mutation: ADD_POST,
        variables: payload,
        update: (cache, { data: { addPost } }) => {
          const data = cache.readQuery({ query: GET_POSTS });
          data.getPosts.unshift(addPost);
          cache.writeQuery({ query: GET_POSTS, data });
        },
        optimisticResponse: {
          __typename: 'Mutation',
          addPost: {
            __typename: 'Post',
            _id: -1,
            ...payload
          }
        },
        refetchQueries: [
          {
            query: INFINITE_SCROLL_POSTS,
            variables: {
              pageNum: 1,
              pageSize: 1
            }
          }
        ]
      });
    },
    searchPosts: async ({ commit }, { searchTerm }) => {
      const { data } = await apolloClient.query({
        query: SEARCH_POSTS,
        variables: { searchTerm }
      });
      commit('setSearchResults', data.searchPosts);
    },
    clearSearchResults({ commit }) {
      commit('clearSearchResults');
    },
    getUserPosts: async ({ commit, getters }) => {
      const { data } = await apolloClient.query({
        query: GET_USER_POSTS,
        variables: {
          userId: getters.user._id
        }
      });
      commit('setUserPosts', data.getUserPosts);
    },
    updateUserPost: async ({ commit, getters }, payload) => {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_USER_POST,
        variables: payload
      });
      const userPosts = [...getters.userPosts];
      const index = userPosts.findIndex(p => p._id === payload.postId);
      userPosts[index] = data.updateUserPost;
      commit('setUserPosts', userPosts);
    },
    deleteUserPost: async ({ commit, getters }, payload) => {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_USER_POST,
        variables: payload
      });
      let userPosts = [...getters.userPosts];
      userPosts = userPosts.filter(f => f._id !== payload.postId);
      commit('setUserPosts', userPosts);
    }
  },
  getters: {
    posts: state => state.posts,
    loading: state => state.loading,
    token: state => state.token || '',
    user: state => state.currentUser,
    authError: state => state.authError,
    favorites: state => state.currentUser && state.currentUser.favorites,
    searchResults: state => state.searchResults,
    userPosts: state => state.userPosts
  }
});
