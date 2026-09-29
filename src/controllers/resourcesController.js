
const pool=require('../db');


async function getResourcesByCourse(req,res){

    const course_id=Number(req.query.course_id);
    if(!Number.isInteger(course_id)||course_id<=0){
        return res.status(400).json({
            message:"Invalid Course ID"
        });
    }
    try{
       const result=await pool.query(
             'select * from course_resources where course_id=$1 order by resource_type, title', [course_id]);
     
        res.status(200).json({
            resources:result.rows
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}
async function getResourceById(req,res){

    const resource_id=Number(req.params.id);

    if(!Number.isInteger(resource_id)||resource_id<=0){
        return res.status(400).json({
            message:'Invalid Resources ID!'
        })
    }
    try{
        const result=await pool.query('select * from course_resources where id =$1',[resource_id])
        if(result.rowCount===0){
            return res.status(404).json({
                message:'Resource Not Found'
            });
        }
        res.status(200).json({resource:result.rows[0]})
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });

    }
}

module.exports={getResourcesByCourse,getResourceById};