
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/db');

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
