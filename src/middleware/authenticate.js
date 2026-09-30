const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    const header = req.get("authorization") || "";
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ message: "Authentication required" });
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).json({ message: "Authentication is unavailable" });
    }
    try {
        const payload = jwt.verify(match[1], process.env.JWT_SECRET, { issuer: "studenthub-api" });
        const userId = Number(payload.userId);
        if (!Number.isSafeInteger(userId) || userId <= 0 || !["student", "contributor", "admin"].includes(payload.role)) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }
        req.user = { userId, role: payload.role };
        return next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired authentication token" });
    }
}

module.exports = { authenticate };
