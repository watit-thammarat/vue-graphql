<template>
  <v-container v-if="getPost" class="mt-3" flexbox center>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card hover>
          <v-card-title>
            <h1>{{ getPost.title }}</h1>
            <v-btn large icon v-if="user">
              <v-icon large color="grey">favorite</v-icon>
            </v-btn>
            <h3 class="ml-3 font-weight-thin">{{ getPost.likes }} LIKES</h3>
            <v-spacer></v-spacer>
            <v-icon @click="goToPrevious" color="info" large>arrow_back</v-icon>
          </v-card-title>
          <v-tooltip right>
            <span>Click to enlarge image</span>
            <v-img @click="toggleImageDialog" slot="activator" :src="getPost.imageUrl" id="post__image"></v-img>
          </v-tooltip>
          <v-dialog v-model="dialog">
            <v-card>
              <v-img :src="getPost.imageUrl" height="80vh"></v-img>
            </v-card>
          </v-dialog>
          <v-card-text>
            <span v-for="(category, index) in getPost.categories" :key="index">
              <v-chip class="mb-3" color="accent" text-color="white">{{ category }}</v-chip>
            </span>
            <h3>{{ getPost.description }}</h3>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <div class="mt-3">
      <v-layout class="mb-3" v-if="user">
        <v-flex class="xs12">
          <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPostMessage">
            <v-layout row>
              <v-flex xs12>
                <v-text-field :rules="messageRules" v-model="messageBody" clearable :append-outer-icon="messageBody && 'send'" label="Add message" type="text" required prepend-icon="email" @click:append-outer="handleAddPostMessage"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap class="mt-3">
              <v-flex xs12>
                <v-list subheader two-line>
                  <v-subheader>Messages {{ getPost.messages.length }}</v-subheader>
                  <template v-for="message in getPost.messages">
                    <v-divider :key="message._id"></v-divider>
                    <v-list-tile avatar inset :key="message.title">
                      <v-list-tile-avatar>
                        <img :src="message.messageUser.avatar">
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>
                          {{ message.messageBody }}
                        </v-list-tile-title>
                        <v-list-tile-sub-title>
                          {{ message.messageUser.username }}
                          <span class="grey--text text-lighten-1 hidden-xs-only">{{ message.messageDate }}</span>
                        </v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-list-tile-action class="hidden-xs-ony">
                        <v-icon :color="checkIfOwnMessage(message) ? 'accent': 'grey'">chat_bubble</v-icon>
                      </v-list-tile-action>
                    </v-list-tile>
                  </template>
                </v-list>
              </v-flex>
            </v-layout>
          </v-form>
        </v-flex>
      </v-layout>
    </div>

  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { GET_POST, ADD_POST_MESSAGE } from '../../queries.js';
export default {
  name: 'Post',
  props: ['id'],
  apollo: {
    getPost: {
      query: GET_POST,
      variables() {
        return { id: this.id };
      }
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  data() {
    return {
      dialog: false,
      messageBody: '',
      loading: false,
      isFormValid: true,
      messageRules: [
        msg => !!msg || 'Message is required',
        msg => msg.length < 75 || 'Message must be less than 75 characters'
      ]
    };
  },
  methods: {
    checkIfOwnMessage({ messageUser }) {
      return this.user && this.user._id === messageUser._id;
    },
    goToPrevious() {
      this.$router.go(-1);
    },
    toggleImageDialog() {
      if (window.innerWidth > 500) {
        this.dialog = !this.dialog;
      }
    },
    async handleAddPostMessage() {
      if (!this.$refs.form.validate()) {
        return;
      }
      const variables = {
        messageBody: this.messageBody,
        postId: this.id,
        userId: this.user._id
      };
      try {
        this.loading = true;
        const { data } = await this.$apollo.mutate({
          mutation: ADD_POST_MESSAGE,
          variables,
          update: (cache, { data: { addPostMessage } }) => {
            const data = cache.readQuery({
              query: GET_POST,
              variables: { id: this.id }
            });
            data.getPost.messages.unshift(addPostMessage);
            cache.writeQuery({
              query: GET_POST,
              data,
              variables: { id: this.id }
            });
          }
        });
        this.messageBody = '';
        this.loading = false;
      } catch (err) {
        console.log(err);
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
#post__image {
  height: 400px !important;
}
</style>
