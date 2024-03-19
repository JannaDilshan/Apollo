import { gql } from 'apollo-server';

const CoursetypeDefs = gql`

type COURSE {
	course_id: String!
	credit_hours: Int!
	department: String!
	name: String!
}

type Query{
    courses:[COURSE!]!
	course(course_id: String!):COURSE!
}

type Mutation{
	createCourse(course_id: String!,credit_hours: Int!,department: String!,name: String!):COURSE
	updateCourse(course_id: String!,credit_hours: Int!,department: String!,name: String!):COURSE
	deleteCourse(course_id: String!): Boolean
}






`;

export default CoursetypeDefs;