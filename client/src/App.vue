<template>
  <v-app style="background: #e3e3ee">
    <v-navigation-drawer app temporary fixed v-model="sideNav">
      <v-toolbar color="accent" dark flat>
        <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
        <router-link to="/" tag="span" style="cursor: pointer">
          <h1 class="title pl-3">Vueshare</h1>
        </router-link>
      </v-toolbar>
      <v-divider></v-divider>
      <v-list>
        <v-list-tile ripple v-for="item in sideNavItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>{{item.title}}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="user" @click="handleSignoutUser">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Signout</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed color="primary" dark>
      <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer">
          VueShare
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field v-model="searchTerm" @input="handleSearchPosts" flex prepend-icon="search" placeholder="Search posts" color="accent" single-line hide-details></v-text-field>

      <v-card dark v-if="searchResults && searchResults.length > 0" id="search__card">
        <v-list>
          <v-list-tile @click="goToSearchResult(result._id)" v-for="result in searchResults" :key="result._id">
            <v-list-tile-title>
              {{ result.title }}
              <span class="font-weight-thin">{{ formatDescription(result.description) }}</span>
            </v-list-tile-title>
            <v-list-tile-action v-if="checkIfUserFavorite(result._id)">
              <v-icon>favorite</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>

      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in horizontalNavItems" :key="item.title" :to="item.link">
          <v-icon class="hidden-sm-only" left>{{item.icon}}</v-icon>
          {{item.title}}
        </v-btn>
        <v-btn flat to="/profile" v-if="user">
          <v-icon class="hidden-sm-only" left>account_box</v-icon>
          <v-badge right color="blue darken-2" :class="{bouce: badgeAnimated}">
            <span slot="badge" v-if="favorites && favorites.length">{{ favorites.length }}</span>
            Profile
          </v-badge>
        </v-btn>
        <v-btn flat v-if="user" @click="handleSignoutUser">
          <v-icon class="hidden-sm-only" left>exit_to_app</v-icon>
          Signout
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <main>
      <v-container class="mt-4">
        <transition name="fade">
          <router-view/>
        </transition>
        <v-snackbar v-model="authSnackbar" color="success" :timeout="5000" bottom left>
          <v-icon class="mr-3">check_circle</v-icon>
          <h3>Your are now signed in!</h3>
          <v-btn dark flat @click="authSnackbar=false">Close</v-btn>
        </v-snackbar>
        <v-snackbar v-if="authError" v-model="authErrorSnackbar" color="info" :timeout="5000" bottom left>
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{ authError.message }}</h3>
          <v-btn dark flat to="/signin">Signin</v-btn>
        </v-snackbar>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'App',
  data() {
    return {
      sideNav: false,
      authSnackbar: false,
      authErrorSnackbar: false,
      badgeAnimated: false,
      searchTerm: '',
      loading: false
    };
  },
  watch: {
    user(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.authSnackbar = true;
      }
    },
    authError(value) {
      if (value) {
        this.authErrorSnackbar = true;
      }
    },
    favorites(value) {
      if (value && value.length) {
        this.badgeAnimated = true;
        setTimeout(() => {
          this.badgeAnimated = false;
        }, 1000);
      }
    }
  },
  computed: {
    ...mapGetters(['user', 'authError', 'favorites', 'searchResults']),
    horizontalNavItems() {
      let items = [
        {
          icon: 'chat',
          title: 'Posts',
          link: '/posts'
        },
        {
          icon: 'lock_open',
          title: 'Sign in',
          link: '/signin'
        },
        {
          icon: 'create',
          title: 'Sign Up',
          link: '/signup'
        }
      ];
      if (this.user) {
        items = [
          {
            icon: 'chat',
            title: 'Posts',
            link: '/posts'
          }
        ];
      }
      return items;
    },
    sideNavItems() {
      let items = [
        {
          icon: 'chat',
          title: 'Posts',
          link: '/posts'
        },
        {
          icon: 'lock_open',
          title: 'Sign in',
          link: '/signin'
        },
        {
          icon: 'create',
          title: 'Sign Up',
          link: '/signup'
        }
      ];
      if (this.user) {
        items = [
          {
            icon: 'chat',
            title: 'Posts',
            link: '/posts'
          },
          {
            icon: 'stars',
            title: 'Create Post',
            link: '/posts/add'
          },
          {
            icon: 'account_box',
            title: 'Profile',
            link: '/profile'
          }
        ];
      }
      return items;
    }
  },
  methods: {
    toggleSideNav() {
      this.sideNav = !this.sideNav;
    },
    async handleSignoutUser() {
      try {
        await this.$store.dispatch('signoutUser');
        this.$router.push('/');
      } catch (err) {
        console.error(err);
      }
    },
    async handleSearchPosts() {
      try {
        this.loading = true;
        await this.$store.dispatch('searchPosts', {
          searchTerm: this.searchTerm
        });
      } catch (err) {
        console.log(err);
        this.loading = false;
      }
    },
    goToSearchResult(id) {
      this.searchTerm = '';
      this.$router.push(`/posts/${id}`);
      this.$store.dispatch('clearSearchResults');
    },
    formatDescription(desc) {
      return desc.length > 20 ? `${desc.slice(0, 20)}...` : desc;
    },
    checkIfUserFavorite(id) {
      return this.favorites && this.favorites.some(f => f._id === id);
    }
  }
};
</script>

<style>
.fade-enter-active,
.fade.leave-active {
  transition-property: all;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  transform: translateY(-25px);
}

.bouce {
  animation: bouce 1s both;
}

@keyframes bouce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

#search__card {
  position: absolute;
  width: 100vw;
  z-index: 8;
  top: 100%;
  left: 0%;
}
</style>
