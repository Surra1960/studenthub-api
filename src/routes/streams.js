
const express=require('express');

const router=express.Router();

const streamsController=require('../controllers/streamsController');


router.get('/',streamsController);




module.exports=router;