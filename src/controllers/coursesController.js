



const pool=require('../db');

async function getCoursesBySemester(req,res){

    const semester_id=Number(req.query.semester_id);
    if(!Number.isInteger(semester_id)||semester_id<=0){
        return res.status(400).json({
            message:"Invalid Semester ID"
        });
    }
    try{
        const result=await pool.query('select * from courses where semester_id=$1 order by code',[semester_id]);
        res.status(200).json({
            courses:result.rows
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}

module.exports=getCoursesBySemester;