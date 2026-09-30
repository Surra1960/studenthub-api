const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        issuer: "studenthub-api"
    });
}

function publicUser(row) {
    return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
        profileImageUrl: row.profile_image_url || null,
        semesterId: row.semester_id || null,
        semesterNumber: row.semester_number || null,
        yearNumber: row.year_number || null,
        programId: row.program_id || null,
        programName: row.program_name || null,
        streamName: row.stream_name || null
    };
}

const profileQuery = `SELECT u.id, u.full_name, u.email, u.role, u.profile_image_url,
    sp.semester_id, s.semester_number, py.year_number, p.id AS program_id,
    p.name AS program_name, st.name AS stream_name
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    LEFT JOIN semesters s ON s.id = sp.semester_id
    LEFT JOIN program_years py ON py.id = s.program_year_id
    LEFT JOIN programs p ON p.id = py.program_id
    LEFT JOIN streams st ON st.id = p.stream_id`;

async function register(req, res) {
    const {
        fullName,
        email,
        password,
        confirmPassword,
        programId,
        semesterId
    } = req.body || {};

    if ([fullName, email, password, confirmPassword, programId, semesterId].some((value) => value === undefined || value === null || String(value).trim() === "")) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Passwords do not match"
        });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
        return res.status(400).json({
            message: "Password must be at least 8 characters"
        });
    }

    if (typeof email !== "string" || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof fullName !== "string" || fullName.trim().length > 120) {
        return res.status(400).json({ message: "Enter a valid name and email address" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const program_id = Number(programId);
    const semester_id = Number(semesterId);

    if (
        !Number.isInteger(program_id) ||
        program_id <= 0 ||
        !Number.isInteger(semester_id) ||
        semester_id <= 0
    ) {
        return res.status(400).json({
            message: "Invalid academic information"
        });
    }

    try {
        const semesterResult = await pool.query(
            `SELECT
                s.id,
                py.program_id
             FROM semesters s
             JOIN program_years py
                ON s.program_year_id = py.id
             WHERE s.id = $1`,
            [semester_id]
        );

        if (semesterResult.rowCount === 0) {
            return res.status(400).json({
                message: "Invalid semester"
            });
        }

        if (semesterResult.rows[0].program_id !== program_id) {
            return res.status(400).json({
                message: "Selected semester does not belong to the selected department"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const userResult = await client.query(
                `INSERT INTO users (
                    full_name,
                    email,
                    password_hash,
                    role
                )
                VALUES ($1, $2, $3, 'student')
                RETURNING id, full_name, email, role`,
                [
                    fullName.trim(),
                    normalizedEmail,
                    passwordHash
                ]
            );

            const user = userResult.rows[0];

            await client.query(
                `INSERT INTO student_profiles (
                    user_id,
                    semester_id
                )
                VALUES ($1, $2)`,
                [
                    user.id,
                    semester_id
                ]
            );

            await client.query("COMMIT");

            res.status(201).json({
                message: "Account created successfully",
                user
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ message: "An account with this email already exists" });
        }
        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function login(req, res) {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password || email.trim().length > 254) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const result = await pool.query(
            `SELECT id, full_name, email, password_hash, role, profile_image_url
             FROM users WHERE email = $1`,
            [normalizedEmail]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = createToken(user);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profile_image_url || null
            }
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function updateProfile(req, res) {
    const { fullName, profileImageUrl } = req.body || {};
    if (fullName !== undefined && (typeof fullName !== "string" || !fullName.trim() || fullName.trim().length > 120)) {
        return res.status(400).json({ message: "Name must be between 1 and 120 characters" });
    }
    if (profileImageUrl !== undefined && profileImageUrl !== null) {
        if (typeof profileImageUrl !== "string" || profileImageUrl.length > 2048) {
            return res.status(400).json({ message: "Profile image URL is invalid" });
        }
        try {
            const parsed = new URL(profileImageUrl);
            if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error("Invalid protocol");
        } catch {
            return res.status(400).json({ message: "Profile image must use a valid HTTP or HTTPS URL" });
        }
    }
    if (fullName === undefined && profileImageUrl === undefined) {
        return res.status(400).json({ message: "No profile changes were provided" });
    }
    try {
        const result = await pool.query(
            `UPDATE users SET
                full_name = COALESCE($2, full_name),
                profile_image_url = CASE WHEN $3::boolean THEN $4 ELSE profile_image_url END,
                updated_at = NOW()
             WHERE id = $1
             RETURNING id, full_name, email, role, profile_image_url`,
            [req.user.userId, fullName === undefined ? null : fullName.trim(), profileImageUrl !== undefined, profileImageUrl || null]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });
        const detail = await pool.query(`${profileQuery} WHERE u.id = $1`, [req.user.userId]);
        return res.status(200).json({ user: publicUser(detail.rows[0]) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function me(req, res) {
    try {
        const result = await pool.query(`${profileQuery} WHERE u.id = $1`, [req.user.userId]);
        if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ user: publicUser(result.rows[0]) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    register,
    login,
    me,
    updateProfile
};
