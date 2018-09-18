import { gql } from 'apollo-boost';

export const GET_POSTS = gql`
  query {
    getPosts {
      _id
      title
      imageUrl
    }
  }
`;

export const SIGNIN_USER = gql`
  mutation($username: String!, $password: String!) {
    signinUser(username: $username, password: $password) {
      token
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation($username: String!, $password: String!, $email: String!) {
    signupUser(username: $username, password: $password, email: $email) {
      token
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      _id
      username
      avatar
      email
      joinDate
      password
      favorites {
        _id
        title
        imageUrl
        description
      }
    }
  }
`;

export const ADD_POST = gql`
  mutation(
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
    $creatorId: ID!
  ) {
    addPost(
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
      creatorId: $creatorId
    ) {
      _id
      title
      imageUrl
      categories
      description
      # createdDate
      # likes
    }
  }
`;

export const INFINITE_SCROLL_POSTS = gql`
  query($pageNum: Int!, $pageSize: Int!) {
    infiniteScrollPosts(pageNum: $pageNum, pageSize: $pageSize) {
      hasMore
      posts {
        _id
        title
        imageUrl
        categories
        description
        createdDate
        likes
        messages {
          _id
        }
        createdBy {
          _id
          username
          avatar
        }
      }
    }
  }
`;
