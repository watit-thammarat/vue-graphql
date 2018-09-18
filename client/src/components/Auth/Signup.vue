<template>
  <v-container text-xs-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Get started here</h1>
      </v-flex>
    </v-layout>
    <v-layout row wrap v-if="error">
      <v-flex xs12 sm6 offset-sm3>
        <form-alert :message="error.message"></form-alert>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="accent" dark>
          <v-container>
            <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleSignupUser">
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="usernameRules" v-model="username" prepend-icon="face" label="Username" type="text" required></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="emailRules" v-model="email" prepend-icon="email" label="Email" type="email" required></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="passwordRules" v-model="password" prepend-icon="extension " label="Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="passwordRules" v-model="passwordConfirmation" prepend-icon="gavel" label="Confirm Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-btn :disabled="!isFormValid || loading" color="info" type="submit" :loading="loading">
                    Signup
                    <span slot="loader " class="custom-loader ">
                      <v-icon light>cached</v-icon>
                    </span>
                  </v-btn>
                  <h3>
                    Already have an account?
                    <router-link to="/signin">Signin</router-link>
                  </h3>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'SignUp',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      loading: false,
      error: null,
      usernameRules: [
        username => !!username || 'Username is required',
        username =>
          username.length < 10 || 'Username must be less than 10 characters'
      ],
      emailRules: [
        email => !!email || 'Email is required',
        email => /.@+./.test(email) || 'Email must be valid'
      ],
      passwordRules: [
        password => !!password || 'Password is required',
        password =>
          password.length > 7 || 'Password must be at least 7 characters',
        confirmation => confirmation === this.password || 'Passwords must match'
      ],
      isFormValid: true
    };
  },
  methods: {
    async handleSignupUser() {
      if (!this.$refs.form.validate()) {
        return;
      }
      try {
        this.loading = true;
        this.error = null;
        await this.$store.dispatch('signupUser', {
          username: this.username,
          email: this.email,
          password: this.password
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
