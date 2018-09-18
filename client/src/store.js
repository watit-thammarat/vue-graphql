import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as apolloClient } from './main';
import {
  GET_POSTS,
  SIGNIN_USER,
  SIGNUP_USER,
  GET_CURRENT_USER,
  ADD_POST
} from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: null,
    loading: false,
    token: null,
    currentUser: null,
    authError: null
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
        }
      });
    }
  },
  getters: {
    posts: state => state.posts,
    loading: state => state.loading,
    token: state => state.token || '',
    user: state => state.currentUser,
    authError: state => state.authError,
    favorites: state => state.currentUser && state.currentUser.favorites
  }
});
