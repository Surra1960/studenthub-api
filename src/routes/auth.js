const express = require("express");
const router = express.Router();

const {
    register,
    login,
    me,
    updateProfile
} = require("../controllers/authControllers");
const { authenticate } = require("../middleware/authenticate");

router.post("/register", register);

router.post("/login", login);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, updateProfile);

module.exports = router;
