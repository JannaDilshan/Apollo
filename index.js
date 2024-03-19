import { ApolloServer,AuthenticationError } from "apollo-server";
import typeDefs from "./Student/StudenttypeDefs.js";
import resolvers from "./Student/Studentresolvers.js";
import teacherResolvers from "./Teachers/teacherresolvers.js";
import teacherTypeDefs from "./Teachers/teachertypeDefs.js";
import Departmentresolvers from "./Department/Departmentresolvers.js";
import departmenttypeDefs from "./Department/DepartmenttypeDefs.js";
import Courseresolvers from "./Course/Courseresolvers.js";
import CoursetypeDefs from "./Course/CoursetypeDefs.js";
import Userresolvers from "./user/Userresolvers.js";
import UsertypeDefs from "./user/UsertypeDefs.js";
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { createRateLimitDirective } from 'graphql-rate-limit';


dotenv.config();
// Neo4j connection details
const neo4jUrl = process.env.NEO4J_URL;
const neo4jUser = process.env.NEO4J_USER;
const neo4jPassword = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(
  neo4jUrl,
  neo4j.auth.basic(neo4jUser, neo4jPassword)
);

const server = new ApolloServer({
  typeDefs: [typeDefs, teacherTypeDefs, departmenttypeDefs, CoursetypeDefs, UsertypeDefs],
  resolvers: [resolvers, teacherResolvers,Departmentresolvers, Courseresolvers, Userresolvers],
  context: ({ req }) => {
  
    
    cors();

    const token = req.headers.authorization || '';
   
    try {
      if (req.body.operationName === "LoginUser" || req.body.operationName === "RegisterUser") {
        return { driver };  
      }
      const expiresIn = 6;

      const user = jwt.verify(token, process.env.JWT_SECRET,{exp: Math.floor(Date.now() / 1000) + expiresIn});
      return { user, driver };
    } catch (err) {
      throw new AuthenticationError('Invalid or expired token');
    }    
  },
  schemaDirectives: {
    rateLimit: createRateLimitDirective({
      identifyContext: (driver) => driver.user ? driver.user.id : '',
      formatError: (error) => {
        if (error.extensions.code === 'RATE_LIMITED') {
          return  new Error('Too many requests, please try again later.');
        }
        return error;
      },
    }),
  },
});


server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});


