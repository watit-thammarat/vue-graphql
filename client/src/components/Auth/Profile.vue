<template>
  <v-container class="text-xs-center">
    <v-flex sm6 offset-sm3>
      <v-card class="white--text" color="secondary">
        <v-layout>
          <v-flex xs5>
            <v-img height="125px" contain :src="user.avatar"></v-img>
          </v-flex>
          <v-flex xs7>
            <v-card-title primary-title>
              <div>
                <div class="headline">{{ user.username }}</div>
                <div>Joined {{ formatJoinDate(user.joinDate) }}</div>
                <div class="hidden-xs-only font-weight-regular">{{ user.favorites.length }} Fovarites</div>
                <div class="hidden-xs-only font-weight-regular">{{ userPosts && userPosts.length }} Posts Added</div>
              </div>
            </v-card-title>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
    <v-container v-if="!favorites.length" class="mt-3">
      <v-layout row wrap>
        <v-flex xs12>
          <h1>You have no favorites currently. Go and add some</h1>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container v-else class="mt-3">
      <v-flex xs12>
        <h2 class="font-weight-light">
          Favorited
          <span class="font-weight-regular">({{ favorites.length }})</span>
        </h2>
      </v-flex>
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="favorite in favorites" :key="favorite._id">
          <v-card class="mt-3 ml-1 mr-2" hover>
            <v-img @click="goToPost(favorite)" height="30vh" :src="favorite.imageUrl"></v-img>
            <v-card-text>{{ favorite.title }}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container class="mt-3" v-if="!userPosts || !userPosts.length">
      <v-layout row wrap>
        <v-flex xs12>
          <h2>You have no posts currently. Go and add some!</h2>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container v-else class="mt-3">
      <v-flex xs12>
        <h2 class="font-weight-regular">({{ userPosts.length }})</h2>
      </v-flex>
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="post in userPosts" :key="post._id">
          <v-card class="mt-3 ml-1 mr-2" hover>
            <v-btn color="info" floating fab small dark @click="loadPost(post)">
              <v-icon>edit</v-icon>
            </v-btn>
            <v-btn color="error" floating fab small dark @click="handleDeleteUserPost(post)">
              <v-icon>delete</v-icon>
            </v-btn>
            <v-img @click="goToPost(post)" height="30vh" :src="post.imageUrl"></v-img>
            <v-card-text>{{ post.title }}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <v-dialog xs12 sm6 offset-sm3 persistent v-model="editPostDialog">
      <v-card>
        <v-card-title class="headline grey lighten-2">Update Post</v-card-title>
        <v-container>
          <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleUpdateUserPost">
            <v-layout row>
              <v-flex xs12>
                <v-text-field :rules="titleRules" v-model="title" label="Post Title" type="text" required></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-text-field :rules="imageRules" v-model="imageUrl" label="Image URL" type="text" required></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <img :src="imageUrl" height="300px">
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-select :rules="categoriesRules" v-model="categories" :items="['Art', 'Education', 'Food', 'Furniture', 'Travel', 'Photography', 'Technology']" multiple label="Categories"></v-select>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-textarea :rules="descRules" v-model="description" label="Description" type="text" required></v-textarea>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn :disabled="!isFormValid || loading" flat class="success--text" type="submit" :loading="loading">
                Update
                <span slot="loader " class="custom-loader ">
                  <v-icon light>cached</v-icon>
                </span>
              </v-btn>
              <v-btn flat class="error--text" @click="editPostDialog = false">
                Cancel
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';

export default {
  name: 'Profile',
  data() {
    return {
      editPostDialog: false,
      error: null,
      loading: false,
      isFormValid: true,
      postId: '',
      title: '',
      imageUrl:
        'https://images.pexels.com/photos/374757/pexels-photo-374757.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      categories: '',
      description: '',
      titleRules: [
        title => !!title || 'Title is required',
        title => title.length < 10 || 'Title must have less than 10 characters'
      ],
      imageRules: [image => !!image || 'Image is required'],
      categoriesRules: [
        categories =>
          categories.length > 0 || 'At least one categories is required'
      ],
      descRules: [
        description => !!description || 'Description is required',
        description =>
          description.length < 200 ||
          'Description must have less than 200 characters'
      ]
    };
  },
  computed: {
    ...mapGetters(['user', 'favorites', 'userPosts'])
  },
  methods: {
    goToPost({ _id }) {
      this.$router.push(`/posts/${_id}`);
    },
    formatJoinDate(date) {
      return moment(new Date(date)).format('ll');
    },
    async handleGetUserPosts() {
      try {
        this.loading = true;
        this.$store.dispatch('getUserPosts');
        this.loading = false;
      } catch (err) {
        console.error(err);
        this.loading = false;
      }
    },
    async handleUpdateUserPost() {
      if (!this.$refs.form.validate()) {
        return;
      }
      try {
        this.loading = true;
        await this.$store.dispatch('updateUserPost', {
          postId: this.postId,
          userId: this.user._id,
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description
        });
        this.$refs.form.reset();
        this.loading = false;
        this.editPostDialog = false;
      } catch (err) {
        console.error(err);
        this.loading = false;
      }
    },
    async handleDeleteUserPost(post) {
      this.loadPost(post, false);
      const deletePost = window.confirm(
        'Are you sure you want to delete this post?'
      );
      if (!deletePost) {
        return;
      }
      try {
        this.loading = true;
        await this.$store.dispatch('deleteUserPost', {
          postId: post._id
        });
        this.loading = false;
      } catch (err) {
        console.error(err);
        this.loading = false;
      }
    },
    loadPost(
      { _id, title, imageUrl, categories, description },
      editPostDialog = true
    ) {
      this.postId = _id;
      this.title = title;
      this.imageUrl = imageUrl;
      this.categories = categories;
      this.description = description;
      this.editPostDialog = editPostDialog;
    }
  },
  created() {
    this.handleGetUserPosts();
  }
};
</script>

<style>
</style>
