const express = require("express");

const app = express();



//routes
app.get('/', (_, res) => {
    res.send("Root route");
});






//starting the server on localhost
app.listen(3000, () => {
    console.log("Server started on localhost 3000");
});