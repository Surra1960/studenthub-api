


const pool=require('../db');

async function getSemestersByProgramYear(req,res){

    const program_year_id=Number(req.query.program_year_id);
    if(!Number.isInteger(program_year_id)||program_year_id<=0){
        return res.status(400).json({
            message:"Invalid Program Year ID"
        });
    }
    try{
        const result=await pool.query('select * from semesters where program_year_id=$1 order by semester_number',[program_year_id]);
     
        res.status(200).json({
            semesters:result.rows
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}

module.exports=getSemestersByProgramYear;