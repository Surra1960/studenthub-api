
const express = require("express");
const cors=require("cors");
const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
} }));
const announcementsRouter=require('./routes/announcements');

 const eventsRouter=require('./routes/events');
 const resourcesRouter=require('./routes/resources');
 const streamsRouter=require('./routes/streams');
 const programsRouter=require('./routes/programs');
 const programYearsRouter=require('./routes/programYears');
 const semestersRouter=require('./routes/semesters');
 const coursesRouter = require('./routes/courses');
 const practiceRoutes = require("./routes/practice");
 const authRoutes = require("./routes/auth");
app.use(express.json());


app.use('/announcements',announcementsRouter);
app.use('/events',eventsRouter);

app.use('/resources',resourcesRouter);
app.use('/streams',streamsRouter);
app.use('/programs',programsRouter);
app.use('/program-years',programYearsRouter);
app.use('/semesters', semestersRouter);
app.use('/courses', coursesRouter);
app.use("/practice", practiceRoutes);
app.use("/auth", authRoutes);

module.exports = app;
