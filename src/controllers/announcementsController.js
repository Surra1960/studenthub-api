

const pool=require('../db');


async function getAllAnnouncements(req,res){
    
    try{
        const {rows}= await pool.query('select * from announcements');
        res.status(200).json({
            announcements: rows
        });
    }catch(err){
        console.error(err);
        res.status(500).json({message:'Internal Server Error'})
    }
}

async function getAnnouncementById(req,res){

    const announcementId=Number(req.params.id,10)
    if(isNaN(announcementId)|| announcementId<=0){
        return res.status(400).json({
            message:'Invalid Announcement Id'
        })
    }
    try{
        const result = await pool.query('select * from announcements where id = $1',[announcementId]);
        if(result.rowCount===0){
           return res.status(404).json({
                message:'Announcement not found!'
            })
        }
        res.status(200).json({
            announcement:result.rows[0]
        })
    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        })
    }
}


async function createAnnouncement(req,res){

    const {title,category,description,date,details}=req.body;
    if(
        !title || title.trim()===""|| !category || category.trim()===""|| !description || description.trim()===""|| !date || date.trim()===""
    ){
        return res.status(400).json({
            message:'Missing Required Fields'
        });
    }
    try{
        const result=await pool.query('insert into announcements(title,category,description,date,details)values($1, $2, $3, $4, $5) returning id, title, category,description,date,details',[title,category,description,date,details]);
        res.status(201).json({
            createdAnnouncement:result.rows[0]
        })

    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}

async function updateAnnouncement(req,res){

    const announcementId=Number(req.params.id,10);
    if(isNaN(announcementId)||announcementId<=0){
        return res.status(400).json({
            message:'Invalid Announcement Id!'
        });
    }
    const {title,category,description,date,details}=req.body;

    try{

        const result= await pool.query('update announcements set title =coalesce($1,title),category =coalesce($2,category),description =coalesce($3,description), date=coalesce($4,date),details =coalesce($5,details) where id=$6 returning id, title, category, description,date, details',[title,category,description,date,details,announcementId]);
        if(result.rowCount===0){
           return res.status(404).json({
                message:'Announcement not found'
            });
        }
        res.status(200).json({updatedAnnouncement:result.rows[0]})

    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });

    }
}

async function deleteAnnouncement(req,res){

    const announcementId=Number(req.params.id,10);
    if(isNaN(announcementId)||announcementId<=0){
        return res.status(400).json({
            message:'Invalid Announcement ID!'
        });
    }
    try{
        const result=await pool.query('delete from announcements where id=$1 returning id,title, category,description,date, details',[announcementId]);
        if(result.rowCount===0){
            return res.status(404).json({
                message:'Announcement not found'
            });

        }
        res.status(200).json({
            deletedAnnouncement:result.rows[0]
        });

    }catch(err){
        console.error(err);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
}


module.exports={getAllAnnouncements,getAnnouncementById,createAnnouncement,updateAnnouncement,deleteAnnouncement};