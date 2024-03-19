import { Neo4jGraphQL } from '@neo4j/graphql';
import { session } from 'neo4j-driver';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60, 
  
});

const resolvers = {

  Query: {
    students: async (parent, args, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const result = await session.run('MATCH (s:STUDENT) RETURN s');
        return result.records.map(record => {
          const student = record.get('s').properties;
          return {
            ...student,
            ID: student.ID.toString(),
            year: student.year.toString()

          };
        });
      } catch (error) {
        console.error('Error retrieving students:', error.message);
      }
    },


    student: async (_, { ID }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const result = await session.run(`MATCH (s:STUDENT {ID: ${ID}}) RETURN s`);
        const record = result.records[0];
        const student = record.get('s').properties;

        return {
          ...student,
          ID: student.ID.toString(),
          year: student.year.toString(),
        };
      } catch (error) {
        console.error('Error retrieving student:', error.message);

      }
    }
  },


  Mutation: {
    createStudent: async (_, { ID, name, major, year }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {

        const existingStudent = await session.run(
          `MATCH (s:STUDENT {ID: ${ID}}) RETURN s`,

        );
        if (existingStudent.records.length > 0) {
          throw new Error('Student with the same ID already exists');

        }

        const result = await session.run(
          `CREATE(s:STUDENT {ID: ${ID}, name: '${name}', major: '${major}', year: ${year}}) RETURN s`);
        const createdStudent = result.records[0].get('s').properties;
        return {
          ...createdStudent,
          ID: createdStudent.ID.toString(),
          year: createdStudent.year.toString(),
        };
      } catch (error) {
        console.error('Error creating student:', error.message);

      }
    },

    updateStudent: async (parent, { ID, name, major, year }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const result = await session.run(`MATCH (s:STUDENT {ID: ${ID}}) SET s.name = '${name}', s.major = '${major}', s.year = ${year} RETURN s`);
        const updateStudent = result.records[0].get('s').properties;
        return {
          ...updateStudent,
          ID: updateStudent.ID.toString(),
          year: updateStudent.year.toString(),
        };
      } catch (error) {
        console.error('Error updating student:', error.message);
        throw error;
      }
    },

    deleteStudent: async (parent, { ID }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        await session.run(`MATCH (s:STUDENT {ID: ${ID}}) DELETE s`);
        return true;
      } catch (error) {
        console.error('Error deleting student:', error.message);
      }
    },
     
  }

};


export default resolvers;
