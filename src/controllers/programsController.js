
const pool=require('../db');

async function getProgramsByStream(req,res){

    const stream_id=Number(req.query.stream_id);
    if(!Number.isInteger(stream_id)||stream_id<=0){
        return res.status(400).json({
            message:"Invalid Stream ID"
        });
    }
    try{
        const result=await pool.query('select * from programs where stream_id=$1',[stream_id]);
     
        res.status(200).json({
            programs:result.rows
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}

module.exports=getProgramsByStream;