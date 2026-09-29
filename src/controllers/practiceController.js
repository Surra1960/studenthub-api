const pool = require("../db");

async function getChaptersByCourse(req, res) {
    const course_id = Number(req.query.course_id);

    if (!Number.isInteger(course_id) || course_id <= 0) {
        return res.status(400).json({
            message: "Invalid Course ID"
        });
    }

    try {
        const result = await pool.query(
            `SELECT *
             FROM practice_chapters
             WHERE course_id = $1
             ORDER BY id`,
            [course_id]
        );

        res.status(200).json({
            chapters: result.rows
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getQuestionsByChapter(req, res) {
    const chapter_id = Number(req.query.chapter_id);

    if (!Number.isInteger(chapter_id) || chapter_id <= 0) {
        return res.status(400).json({
            message: "Invalid Chapter ID"
        });
    }

    try {
        const result = await pool.query(
            `SELECT
                id,
                chapter_id,
                question_text,
                question_type,
                points,
                explanation
             FROM practice_questions
             WHERE chapter_id = $1
             ORDER BY id`,
            [chapter_id]
        );

        res.status(200).json({
            questions: result.rows
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getQuestionItems(req, res) {
    const question_id = Number(req.query.question_id);

    if (!Number.isInteger(question_id) || question_id <= 0) {
        return res.status(400).json({
            message: "Invalid Question ID"
        });
    }

    try {
        const result = await pool.query(
            `SELECT
                id,
                question_id,
                option_text,
                option_order,
                item_role,
                item_data
             FROM practice_question_items
             WHERE question_id = $1
             ORDER BY option_order NULLS LAST, id`,
            [question_id]
        );

        const items = result.rows;

        if (
            items.length > 0 &&
            items.every((item) => item.item_role === "matching_pair")
        ) {
            const leftItems = items.map((item) => ({
                id: item.id,
                text: item.item_data.left
            }));

            const rightItems = items
                .map((item) => ({
                    id: item.id,
                    text: item.item_data.right
                }))
                .sort(() => Math.random() - 0.5);

            return res.status(200).json({
                items: {
                    type: "matching",
                    leftItems,
                    rightItems
                }
            });
        }

        res.status(200).json({
            items
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getChapterQuestionsWithItems(req, res) {
    const chapter_id = Number(req.params.id);

    if (!Number.isInteger(chapter_id) || chapter_id <= 0) {
        return res.status(400).json({
            message: "Invalid Chapter ID"
        });
    }

    try {
        const chapterResult = await pool.query(
            `SELECT
                id,
                course_id,
                title,
                description
             FROM practice_chapters
             WHERE id = $1`,
            [chapter_id]
        );

        if (chapterResult.rowCount === 0) {
            return res.status(404).json({
                message: "Chapter Not Found"
            });
        }

        const questionsResult = await pool.query(
            `SELECT
                id,
                chapter_id,
                question_text,
                question_type,
                points,
                explanation
             FROM practice_questions
             WHERE chapter_id = $1
             ORDER BY id`,
            [chapter_id]
        );

        const questions = [];

        for (const question of questionsResult.rows) {
            const itemsResult = await pool.query(
                `SELECT
                    id,
                    question_id,
                    option_text,
                    option_order,
                    item_role,
                    item_data
                 FROM practice_question_items
                 WHERE question_id = $1
                 ORDER BY option_order NULLS LAST, id`,
                [question.id]
            );

            let items = itemsResult.rows;

            if (
                question.question_type === "matching" &&
                items.every((item) => item.item_role === "matching_pair")
            ) {
                const leftItems = items.map((item) => ({
                    id: item.id,
                    text: item.item_data.left
                }));

                const rightItems = items
                    .map((item) => ({
                        id: item.id,
                        text: item.item_data.right
                    }))
                    .sort(() => Math.random() - 0.5);

                items = {
                    type: "matching",
                    leftItems,
                    rightItems
                };
            }

            questions.push({
                ...question,
                items
            });
        }

        res.status(200).json({
            chapter: chapterResult.rows[0],
            questions
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    getChaptersByCourse,
    getQuestionsByChapter,
    getQuestionItems,
    getChapterQuestionsWithItems
};