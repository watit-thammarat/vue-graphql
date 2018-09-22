<template>
  <v-container text-xs-center>
    <v-layout row>
      <v-dialog v-model="isLoading" persistent fullscreen>
        <v-container fill-height>
          <v-layout row justify-center align-center>
            <v-progress-circular indeterminate :size="70" :width="7" color="secondary"></v-progress-circular>
          </v-layout>
        </v-container>
      </v-dialog>
    </v-layout>
    <v-layout class="mt-2 mb-3" row wrap v-if="!loading">
      <v-flex xs12>
        <v-btn class="secondary" to="/posts" large dark>Explore Posts</v-btn>
      </v-flex>
    </v-layout>
    <v-flex xs12>
      <v-carousel v-if="!isLoading && posts && posts.length > 0" v-bind="{ cycle: true }" interval="3000">
        <v-carousel-item @click.native="goToPost(post._id)" v-for="post in posts" :key="post._id" :src="post.imageUrl">
          <h1 style="color: #fff;" class="carousel__title">{{ post.title }}</h1>
        </v-carousel-item>
      </v-carousel>
    </v-flex>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  nanme: 'Home',
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    // posts() {
    //   return this.$store.getters['posts'];
    // },
    // loading() {
    //   return this.$store.getters['loading'];
    // }
    ...mapGetters(['loading', 'posts'])
  },
  methods: {
    async handleGetCarouselPosts() {
      try {
        this.isLoading = true;
        await this.$store.dispatch('getPosts');
        this.isLoading = false;
      } catch (err) {
        this.isLoading = false;
      }
    },
    goToPost(id) {
      this.$router.push(`/posts/${id}`);
    }
  },
  mounted() {
    this.handleGetCarouselPosts();
  }
};
</script>

<style>
.carousel__title {
  cursor: pointer;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px 5px 0 0;
  padding: 0.5em;
  margin: 0 auto;
  bottom: 50px;
  left: 0;
  right: 0;
}
</style>
