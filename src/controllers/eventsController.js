

const pool=require('../db');


async function getAllEvents(req,res){
    try{
        const result = await pool.query('select * from events');
       
        res.status(200).json({
            Events:result.rows
        })

    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });

    }
}

async function getEventById(req,res){

    const eventId=Number(req.params.id);
    
    if(isNaN(eventId)|| eventId<=0){
        return res.status(400).json({
            message:'Invalid Event Id'
        });
    }
    try{
        const result=await pool.query('select * from events where id=$1',[eventId]);
        if(result.rowCount===0){
            return res.status(404).json({
                message:'Event Not Found'
            })
        }
        res.status(200).json({
            event:result.rows[0]
        });

    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }

}

async function createEvent(req,res){

    const {title,description,location,date,organizer,category,image_url}=req.body;

    if(
        !title || title.trim()===""||!description || description.trim()===""||!location || location.trim()===""||!date||isNaN(Date.parse(date))||!organizer || organizer.trim()===""||!category || category.trim()===""
    ){
        return res.status(400).json({
            message:'Missing Required Fields'
        });
    }
    try{
        const result=await pool.query('insert into events(title,description,location,date,organizer,category,image_url) values($1, $2, $3, $4, $5, $6, $7) returning id,title,description,location,date,organizer,category,image_url,created_at',[title,description,location,date,organizer,category,image_url]);

        res.status(201).json({
            createdEvent:result.rows[0]
        })

    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }


}

async function updateEvent(req,res){

    const eventId= Number(req.params.id);
    const {title,description,location,date,organizer,category,image_url}=req.body;
    if(isNaN(eventId)||eventId<=0){
        return res.status(400).json({
            message:'Invalid Event ID!'
        });
    }
    if(date){
          if(isNaN(Date.parse(date))){
        return res.status(400).json({
            message:'Invalid Date'
        });
    }
    }
  
    try{
        const result=await pool.query('update events set title=coalesce($1,title),description=coalesce($2,description),location=coalesce($3,location),date=coalesce($4,date),organizer=coalesce($5,organizer),category=coalesce($6,category),image_url=coalesce($7,image_url) where id=$8 returning id,title,description,location,date,organizer,category,image_url,created_at',[title,description,location,date ,organizer,category,image_url,eventId]);
        if(result.rowCount===0){
            return res.status(404).json({
                message:'Event not found'
            })
        }
        res.status(200).json({
            updateEvent:result.rows[0]
        });

    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });

    }
}

async function deleteEvent(req,res){
    const eventId=Number(req.params.id);
    if(isNaN(eventId)||eventId<=0){
        return res.status(400).json({
            message:'Invalid Event ID!'
        });
    }
    try{
        const result=await pool.query('delete from events where id=$1 returning id,title,description,location,date,organizer,category,image_url,created_at',[eventId]);
        if(result.rowCount===0){
            return res.status(404).json({
                message:'Event not found'
            })
        }
        res.status(200).json({
            deleteEvent:result.rows[0]
        })
    }catch(err)
    {
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}

module.exports={getAllEvents,getEventById,createEvent,updateEvent,deleteEvent};