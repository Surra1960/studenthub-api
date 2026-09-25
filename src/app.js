
const express = require("express");
const cors=require("cors");
const app = express();
app.use(cors({
    origin:'http://localhost:5173'
}));
const announcementsRouter=require('./routes/announcements');

 const eventsRouter=require('./routes/events');

app.use(express.json());


app.use('/announcements',announcementsRouter);
app.use('/events',eventsRouter);

module.exports = app;