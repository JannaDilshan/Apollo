import { Neo4jGraphQL } from '@neo4j/graphql';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60, 
  
});
const teacherresolvers = {
  Query: {
    teachers: async (parent, args, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const result = await session.run('MATCH (t:TEACHER) RETURN t');
        return result.records.map(record => {
          const teacher = record.get('t').properties;
          return {
            ...teacher,
            ID: teacher.ID.toString(),
          };
        });
      } catch (error) {
        console.error('Error connecting to the database:', error.message);
        throw error;
      }
    },
    teacher: async (parent, { ID }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const result = await session.run(`MATCH(t:TEACHER{ID:${ID}}) RETURN t`);
        const teacher = result.records[0].get('t').properties;
        return {
          ...teacher,
          ID: teacher.ID.toString(),
        }
      }
      catch (error) {
        console.log("Your Error is",error.message);
      }
    },
  },
  Mutation: {
    createTeacher: async (parent, { ID, department, name }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const existingTeacher = await session.run(
          `MATCH (t:TEACHER {ID: ${ID}}) RETURN t`,

        );
        if (existingTeacher.records.length > 0) {
         
          throw new Error('Teacher with the same ID already exists');
         
        }
        const teacherRusalt = await session.run(`CREATE(t:TEACHER {ID:${ID},department:'${department}', name:'${name}'}) RETURN t`);
        const createTeacher = teacherRusalt.records[0].get('t').properties;
        return {
          ...createTeacher,
          ID: createTeacher.ID.toString()
        }
      }
      catch (error) {
        console.log("Your create teacher is ", error.message);
      }
    },

    updateTeacher: async (parent, { ID, department, name }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const Teacherresult = await session.run(`MATCH (t:TEACHER {ID: ${ID}}) SET t.department = '${department}', t.name = '${name}' RETURN t`);
        const updateTeacher = Teacherresult.records[0].get('t').properties;
        return {
          ...updateTeacher,  
          ID: updateTeacher.ID.toString(),
        };
      } 
      
      catch (error) {
        console.log("Your create teacher is ", error.message);
      }
    },

    deleteTeacher : async (parent,{ID},{driver}) => {
      await rateLimiter.consume(driver);
     const session = driver.session();
     try{
      await session.run(`MATCH(t:TEACHER{ID: ${ID}}) DELETE t`);
      return true;
     }

     catch(error){
      console.log(error);

     }
    }
  }
}
export default teacherresolvers;