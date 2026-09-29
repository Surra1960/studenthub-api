const express = require("express");
const router = express.Router();

const {
    getChaptersByCourse,
    getQuestionsByChapter,
    getQuestionItems,
    getChapterQuestionsWithItems
} = require("../controllers/practiceController");

router.get("/chapters", getChaptersByCourse);

router.get("/questions", getQuestionsByChapter);

router.get("/question-items", getQuestionItems);

router.get("/chapters/:id/questions", getChapterQuestionsWithItems);

module.exports = router;