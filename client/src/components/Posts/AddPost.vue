<template>
  <v-container text-xs-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1 class="primary--text">Add Post</h1>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPost">
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
          <v-layout row>
            <v-flex xs12>
              <v-btn :disabled="!isFormValid || loading" color="info" type="submit" :loading="loading">
                Submit
                <span slot="loader " class="custom-loader ">
                  <v-icon light>cached</v-icon>
                </span>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'AddPost',
  data() {
    return {
      error: null,
      loading: false,
      isFormValid: true,
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
  methods: {
    async handleAddPost() {
      if (!this.$refs.form.validate()) {
        return;
      }
      try {
        this.loading = true;
        await this.$store.dispatch('addPost', {
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description
        });
        // this.loading = false;
        this.$router.push('/');
      } catch (err) {
        this.loading = false;
        this.error = err;
      }
    }
  }
};
</script>

<style>
</style>
