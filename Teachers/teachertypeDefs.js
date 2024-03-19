import { gql } from 'apollo-server';

const teachertypeDefs = gql`
type TEACHER {
    ID: ID!
    department: String!
    name: String!
  }
  
  type Query {
    teachers: [TEACHER!]
    teacher(ID: ID!):TEACHER
  }

  type Mutation {
    createTeacher(ID: ID!,department: String!,name: String!):TEACHER
    updateTeacher(ID: ID!,department: String!,name: String!):TEACHER
    deleteTeacher(ID:ID!):Boolean
  }
`;

export default teachertypeDefs;