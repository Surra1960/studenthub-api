
const express = require("express");
const app = express();
const announcementsRouter=require('./routes/announcements')

app.use(express.json());


app.use('/announcements',announcementsRouter);

module.exports = app;