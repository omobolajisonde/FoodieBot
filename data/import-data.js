const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "../.env" });
const connectToMongoDB = require("../db");

const Menu = require("../models/menuModel");

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );

connectToMongoDB()
  .then(() => {
    console.log("Connection to MongoDB is successful.");
    // READ JSON FILE

    const menu = JSON.parse(
      fs.readFileSync(path.join(__dirname, "menu.json"), "utf-8")
    );

    // IMPORT DATA INTO DB
    const importData = async function () {
      try {
        await Menu.create(menu);
        console.log("Data successfully uploaded!");
      } catch (error) {
        console.log(error);
      } finally {
        process.exit();
      }
    };

    // OFFLOAD DATA FROM COLLECTION
    const offloadData = async function () {
      try {
        await Menu.deleteMany({});
        console.log("Data successfully offloaded!");
      } catch (error) {
        console.log(error);
      } finally {
        process.exit();
      }
    };

    // RUNS THE importData FUNCTION, if process.argv[2] equals "--import"
    process.argv[2] === "--import" && importData();

    // RUNS THE offloadData FUNCTION, if process.argv[2] equals "--offload"
    process.argv[2] === "--offload" && offloadData();

    // console.log(process.argv);
  })
  .catch((error) => {
    console.log(
      error.message || error,
      "Connection to MongoDB was unsuccessful."
    );
  });
