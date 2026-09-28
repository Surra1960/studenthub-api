
const express=require('express');

const router=express.Router();

const programsController=require('../controllers/programsController');


router.get('/',programsController);




module.exports=router;