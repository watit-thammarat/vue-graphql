import Vue from 'vue';
import Router from 'vue-router';

import Home from './components/Home.vue';
import AddPost from './components/Posts/AddPost.vue';
import Posts from './components/Posts/Posts.vue';
import Profile from './components/Auth/Profile.vue';
import SignIn from './components/Auth/Signin.vue';
import Signup from './components/Auth/Signup.vue';
import Post from './components/Posts/Post.vue';
import authGuard from './authGuard';

Vue.use(Router);

export default new Router({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/posts',
      name: 'posts',
      component: Posts
    },
    {
      path: '/posts/add',
      name: 'addPost',
      component: AddPost,
      beforeEnter: authGuard
    },
    {
      path: '/posts/:id',
      name: 'post',
      component: Post,
      props: true
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      beforeEnter: authGuard
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    }
  ]
});
