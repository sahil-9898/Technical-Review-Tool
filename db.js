const Mongoose = require("mongoose");

//connection to DB
const db = async () => {
    await Mongoose.connect(
        process.env.DB_CONNECTION,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        () => {
            console.log("DB connected");
        }
    );
};
db();
