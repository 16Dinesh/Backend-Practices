const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

app.set("views", path.join(__dirname, "views"));
app.set("view engine" , "ejs");

main()
    .then(() => {
        console.log("connection successful");
    })
    .catch((err) => console.log(err));


async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chat');
}

app.get("/" , (req,res)=>{
    res.send("working")
})

app.listen(8080 , ()=> {
    console.log(`Server is working : 8080`)
})