const express = require("express");
const router = express.Router();

const {
    getChaptersByCourse,
    getQuestionsByChapter,
    getQuestionItems,
    getChapterQuestionsWithItems,getQuestionAnswer
} = require("../controllers/practiceController");

router.get("/chapters", getChaptersByCourse);

router.get("/questions", getQuestionsByChapter);

router.get("/question-items", getQuestionItems);

router.get("/chapters/:id/questions", getChapterQuestionsWithItems);
router.get("/questions/:id/answer", getQuestionAnswer);
module.exports = router;