

const express=require('express');

const router=express.Router();

const semestersController=require('../controllers/semestersController');


router.get('/',semestersController);




module.exports=router;