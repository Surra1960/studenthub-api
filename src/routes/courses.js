


const express=require('express');

const router=express.Router();

const coursesController=require('../controllers/coursesController');


router.get('/',coursesController);




module.exports=router;