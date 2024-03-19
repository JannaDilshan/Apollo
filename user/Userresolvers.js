import { Neo4jGraphQL } from '@neo4j/graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';
let latestId = 0;


const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60, 
  
});

export const Userresolvers = {
  Query: {
    users: async (parent, args, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
          const result = await session.run('MATCH (u:USER) RETURN u');
          return result.records.map(record => {
              const user = record.get('u').properties;
              const id = user.ID ? user.ID.toString() : '';
              return {
                  ...user,
                  ID: id
              };
          });
      } catch (error) {
          console.error('Error retrieving User:', error.message);
          throw new Error('Failed to retrieve users');
      } 
  },

  
  user: async (parent, { ID }, { driver }) => {
    await rateLimiter.consume(driver);
    const session = driver.session();
    try {
        const result = await session.run(`MATCH(u:USER {ID: ${ID}}) RETURN u`);
        if (result.records.length === 0) {
            throw new Error('User not found');
        }
        const user = result.records[0].get('u').properties;
        return {
            ...user,
            ID: user.ID.toString(),
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
    } 
}


  },
  Mutation: {
    registerUser: async (_, { username, email, password }, { driver }) => {
      
      const session = driver.session();
      try {
        const existingUser = await session.run(
          `MATCH (u:USER {username: '${username}'}) RETURN u`,
        );
    
        if (existingUser.records.length > 0) {
          throw new Error('User already exists');
        }
        latestId++; 
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await session.run(
          `CREATE (u:USER {ID: ${latestId}, username: $username, email: $email, password: $password}) RETURN u`,
          { username, email, password: hashedPassword }
        );
    
        const user = result.records[0].get('u').properties;
        return { 
          ...user, 
          ID: user.ID.toString()
        };
      } catch (error) {
        console.error(error);
        throw error; 
    }
  },

    loginUser: async (_, { username, password }, { driver }) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (u:USER {username: '${username}'}) RETURN u`,
          
        );
        const record = result.records[0];
        if (!record) {
          throw new Error('User not found');
        }
    
        const user = record.get('u').properties;
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid password');
        }
    
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
        return {
          
          token,
          user: {
            username: user.username,
            email: user.email,
           
          },
         
        };
      } catch (error) {
        console.error('Error logging in:', error.message);
        throw new Error('Failed to log in');
      } 
    },
    

    updateUser : async (_, { ID, username, email, password }, { driver }) =>{
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userresult = await session.run(
          `MATCH (u:USER {ID: ${ID}}) SET u.username = '${username}', u.email = '${email}', u.password = '${hashedPassword}' RETURN u`);        
       
        console.log(userresult);
        const user = userresult.records[0].get('u').properties;
        return {
           ...user, 
           ID: user.ID.toString() 
          };
      } catch(error) {
        console.log(error);
      }
    },

    deleteUser: async (_, { ID }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        await session.run(`MATCH (u:USER {ID: ${ID}}) DELETE u`);
        return true;
      } catch (error) {
        console.error('Error deleting user:', error.message);
        throw new Error('Failed to delete user');
      } 
    },
    
  },
};
export default Userresolvers;