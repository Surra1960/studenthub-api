
const express=require('express');
const router=express.Router();
const {getAllAnnouncements,getAnnouncementById,createAnnouncement,updateAnnouncement,deleteAnnouncement}=require('../controllers/announcementsController');



router.get('/',getAllAnnouncements);
router.get('/:id',getAnnouncementById);
router.post('/',createAnnouncement);
router.put('/:id',updateAnnouncement);
router.delete('/:id',deleteAnnouncement);

module.exports=router;