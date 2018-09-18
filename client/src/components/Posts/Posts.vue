<template>
  <v-container fluid grid-list-xl>
    <v-layout row wrap v-if="infiniteScrollPosts">
      <v-flex xs12 sm6 v-for="post in infiniteScrollPosts.posts" :key="post._id">
        <v-card hover>
          <v-img :src="post.imageUrl" height="30vh" lazy></v-img>
          <v-card-actions>
            <v-card-title primary>
              <div>
                <div class="headline">{{ post.title }}</div>
                <span class="grey--text">{{ post.likes }} likes - {{ post.messages.length }} comments</span>
              </div>
            </v-card-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="showPostCreator = !showPostCreator">
              <v-icon>{{showPostCreator ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}}</v-icon>
            </v-btn>
          </v-card-actions>
          <v-slide-y-transition>
            <v-card-text v-show="showPostCreator" class="grey lighten-4">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img :src="post.createdBy.avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title class="text-primary">{{ post.createdBy.username }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class="font-weight-thin">Added {{ post.createdDate }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-btn icon ripple>
                    <v-icon color="grey lighten-1">info</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-card-text>
          </v-slide-y-transition>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout column v-if="showMoreEnabled">
      <v-flex xs12>
        <v-layout justify-center row>
          <v-btn color="info" @click="showMorePosts">fetch more</v-btn>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { INFINITE_SCROLL_POSTS } from '../../queries.js';

const pageSize = 1;

export default {
  name: 'Posts',
  data() {
    return {
      pageNum: 1,
      showMoreEnabled: true,
      showPostCreator: true
    };
  },
  apollo: {
    infiniteScrollPosts: {
      query: INFINITE_SCROLL_POSTS,
      variables: {
        pageNum: 1,
        pageSize
      }
    }
  },
  methods: {
    showMorePosts() {
      this.pageNum += 1;
      this.$apollo.queries.infiniteScrollPosts.fetchMore({
        variables: {
          pageNum: this.pageNum,
          pageSize
        },
        updateQuery: (cache, { fetchMoreResult }) => {
          const newPosts = fetchMoreResult.infiniteScrollPosts.posts;
          const hasMore = fetchMoreResult.infiniteScrollPosts.hasMore;
          this.showMoreEnabled = hasMore;
          return {
            infiniteScrollPosts: {
              __typename: cache.infiniteScrollPosts.__typename,
              posts: [...cache.infiniteScrollPosts.posts, ...newPosts],
              hasMore
            }
          };
        }
      });
    }
  },
  created() {}
};
</script>

<style>
</style>
