import { Neo4jGraphQL } from '@neo4j/graphql';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60, 
  
});
const Courseresolvers = {
    Query: {
        courses: async (parent, args, { driver }) => {
            await rateLimiter.consume(driver);
            const session = driver.session();
            try {
                const courseResult = await session.run(`MATCH(c:COURSE) RETURN c`)
                return courseResult.records.map(record => {
                    const courses = record.get('c').properties;
                    return {
                        ...courses,
                        credit_hours: courses.credit_hours.toString(),
                    }
                })
            }
            catch (error) {
                console.log(error);
            }
        },
        course: async (parent, { course_id }, { driver }) => {
            await rateLimiter.consume(driver);
            const session = driver.session();
            try {
                const courseResult = await session.run(`MATCH(c:COURSE {course_id : '${course_id}'}) RETURN c`)
                const course = courseResult.records[0].get(`c`).properties;
                return {
                    ...course,

                    credit_hours: course.credit_hours.toString(),
                }
            }
            catch (error) {
                console.log(error);
            }
        }

    },

    Mutation:{

        createCourse: async(parent,{course_id,credit_hours,department,name},{driver}) =>{
            await rateLimiter.consume(driver);
            const session =driver.session();
            try{

                const existingCourse = await session.un(`MATCH(c:COURSE {course_id:'${course_id}'})`);

                if(existingCourse.records.length> 0 ){
                    throw new Error("Your course has already been entered")
                }
                const courseResult = await session.run(`CREATE(c:COURSE {course_id:'${course_id}',credit_hours:${credit_hours},department:'${department}',name:'${name}'})RETURN c`);
                const createCourse = courseResult.records[0].get('c').properties;
                return{
                    ...createCourse,
                    credit_hours:createCourse.credit_hours.toString(),
                }
            }
            catch(error){
                console.log(error);
            }
        },
        updateCourse : async (parent,{course_id,credit_hours,department,name},{driver}) =>{
            await rateLimiter.consume(driver);
            const session = driver.session();
            try{
                const courseResult = await session.run(`MATCH(c:COURSE {course_id :'${course_id}'}) SET c.credit_hours=${credit_hours},c.department='${department}',c.name='${name}' RETURN c`);
                const updateCourse = courseResult.records[0].get('c').properties;
                return{
                    ...updateCourse,
                    credit_hours:updateCourse.credit_hours.toString(),
                }
            }
            catch(error){
                console.log(error);
            }
        },
        deleteCourse : async (parent,{course_id},{driver}) =>{
            await rateLimiter.consume(driver);
            const session = driver.session();
            try{
                await session.run(`MATCH(c:COURSE {course_id:'${course_id}'}) DELETE c`);
                return true;
            }
            catch(error){
                console.log(error);
            }
        }

    }
}

export default Courseresolvers;