import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as apolloClient } from './main';
import {
  GET_POSTS,
  SIGNIN_USER,
  SIGNUP_USER,
  GET_CURRENT_USER
} from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: null,
    loading: false,
    token: null,
    currentUser: null
  },
  mutations: {
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
    getCurrentUser: async ({ commit }) => {
      const { data } = await apolloClient.query({
        query: GET_CURRENT_USER,
        fetchPolicy: 'network-only'
      });
      commit('setCurrentUser', data.getCurrentUser);
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
    }
  },
  getters: {
    posts: state => state.posts,
    loading: state => state.loading,
    token: state => state.token || '',
    user: state => state.currentUser
  }
});
