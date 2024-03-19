import { gql } from 'apollo-server';

export const UsertypeDefs = gql`
  type USER{
    ID: ID!
    username: String!
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: USER!
  }

  type Query {
    users:[USER]
    user(ID: ID!): USER
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): USER
    loginUser(username: String!, password: String!): AuthPayload!
    updateUser(ID: ID!, username: String, email: String, password: String): USER
    deleteUser(ID: ID!): Boolean
  }
`;
export default UsertypeDefs;