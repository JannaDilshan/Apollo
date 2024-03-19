import { gql } from 'apollo-server';
import { createRateLimitDirective } from 'graphql-rate-limit';

const departmenttypeDefs = gql`
type DEPARTMENT {
	ID: ID!
	head_of_department: String!
	name: String!
}
  
  type Query {
    departments: [DEPARTMENT] 
    department(ID:ID!):DEPARTMENT
  }
  type Mutation{
    createDepartment(ID: ID!,head_of_department: String!,name: String!):DEPARTMENT 
    updateDepartment(ID: ID!,head_of_department: String!,name: String!):DEPARTMENT 
    deleteDepartment(ID:ID!):Boolean
  }
`;

export default departmenttypeDefs;