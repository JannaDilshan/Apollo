import { gql } from 'apollo-server';

const typeDefs = gql`
  type STUDENT {
    ID: ID!
    name: String!
    major: String!
    year: Int!
  }

  type Query {
    students: [STUDENT!]!
    student(ID: ID!):STUDENT
    
}
type Mutation {
  createStudent(ID: ID! , name: String!, major: String!, year: Int!): STUDENT
  updateStudent(ID: ID!, name: String!, major: String!, year: Int!): STUDENT
  deleteStudent(ID: ID!): Boolean
  
}

`;

export default typeDefs;
