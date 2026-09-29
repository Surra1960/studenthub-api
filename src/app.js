
const express = require("express");
const cors=require("cors");
const app = express();
app.use(cors({
    origin:'http://localhost:5173'
}));
const announcementsRouter=require('./routes/announcements');

 const eventsRouter=require('./routes/events');
 const resourcesRouter=require('./routes/resources');
 const streamsRouter=require('./routes/streams');
 const programsRouter=require('./routes/programs');
 const programYearsRouter=require('./routes/programYears');
 const semestersRouter=require('./routes/semesters');
 const coursesRouter = require('./routes/courses');
 const practiceRoutes = require("./routes/practice");

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

module.exports = app;