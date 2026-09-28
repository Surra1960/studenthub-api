

const pool=require('../db');

async function getProgramYearsByProgram(req,res){

    const program_id=Number(req.query.program_id);
    if(!Number.isInteger(program_id)||program_id<=0){
        return res.status(400).json({
            message:"Invalid Program ID"
        });
    }
    try{
        const result=await pool.query('select * from program_years where program_id=$1 order by year_number',[program_id]);
     
        res.status(200).json({
            programYears:result.rows
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}

module.exports=getProgramYearsByProgram;