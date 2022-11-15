const mongoose = require("mongoose");

async function dbConnect() {
  try {
    await mongoose.connect(
      process.env.DB_URI
    );
    console.log("connected to database");
  } catch (error) {
    console.error("could not connect to database");
  }
}

module.exports = dbConnect;