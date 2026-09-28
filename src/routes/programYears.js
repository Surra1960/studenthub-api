

const express=require('express');

const router=express.Router();

const programYearsController=require('../controllers/programYearsController');


router.get('/',programYearsController);




module.exports=router;