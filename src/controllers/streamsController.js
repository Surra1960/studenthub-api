

const pool=require('../db');

async function getStreams(req,res){


    try{
        const result=await pool.query('select * from streams order by id');

        res.status(200).json({
            streams:result.rows
        })
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });

    }
}

module.exports=getStreams;