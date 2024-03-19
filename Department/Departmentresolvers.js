import { Neo4jGraphQL } from '@neo4j/graphql';
import { driver, session } from 'neo4j-driver';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60, 
  
});
const Departmentresolvers = {
  Query: {
    departments: async (parent, args, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const result = await session.run('MATCH (d:DEPARTMENT) RETURN d');
        return result.records.map(record => {
          const department = record.get('d').properties;
          return {
            ...department,
            ID: department.ID.toString(),
          };
        });
      } catch (error) {
        console.error('Your Error is:', error.message);
      }
    },

    department: async (parent, { ID }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const departmentResult = await session.run('MATCH (d:DEPARTMENT {ID : $id}) RETURN d', { id: ID });
        const department = departmentResult.records[0].get('d').properties;
        return {
          ...department,
          ID: department.ID.toString()
        };
      } catch (error) {
        console.error('Your Error is:', error.message);
      }
    },
  },

  Mutation: {
    createDepartment: async (parent, { ID, head_of_department, name }, { driver }) => {
      await rateLimiter.consume(driver);
      const session = driver.session();
      try {
        const existingTeacher = await session.run(
          `MATCH (d:DEPARTMENT {ID: ${ID}}) RETURN d`,

        );
        if (existingTeacher.records.length > 0) {
         
          throw new Error('DEPARTMENT with the same ID already exists');
         
        }
        const departmentResult = await session.run(`CREATE (d:DEPARTMENT {ID: ${ID} , head_of_department:'${head_of_department}',name : '${name}' }) RETURN d`);
        const createDepartment = departmentResult.records[0].get('d').properties;
        return {
          ...createDepartment,
          ID: createDepartment.ID.toString()
        }
      }
      catch (error) {
        console.log(error);
      }
    }, 
    updateDepartment: async (parent,{ID, head_of_department, name },{driver}) =>{
      await rateLimiter.consume(driver);
      const session = driver.session();
      try{
      const departmentResult = await session.run(`MATCH(d:DEPARTMENT {ID:${ID}}) SET d.head_of_department = '${head_of_department}', d.name = '${name}' RETURN d`);
      const updateDepartment = departmentResult.records[0].get('d').properties;
      return{
        ...updateDepartment,
        ID:updateDepartment.ID.toString()
      }
    }
      catch(error){
        console.log(error);

      }
    },
    deleteDepartment: async(parent,{ID},{driver}) =>{
      await rateLimiter.consume(driver);
      const session = driver.session();
      try{
        await session.run(`MATCH(d:DEPARTMENT {ID:${ID}}) DELETE d`)
        return true;
      }
      catch(error){
        console.log(error);
      }
    }

  }
}
export default Departmentresolvers;