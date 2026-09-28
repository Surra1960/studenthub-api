

const express=require('express');

const router=express.Router();

const {getResourcesByCourse,getResourceById}=require('../controllers/resourcesController');


router.get('/',getResourcesByCourse);
router.get('/:id',getResourceById)



module.exports=router;