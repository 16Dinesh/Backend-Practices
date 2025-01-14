const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");

app.set("views", path.join(__dirname, "views"));
app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));


main()
    .then(() => {
        console.log("connection successful");
    })
    .catch((err) => console.log(err));


async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chat');
}

//Index Route
app.get("/chats", async (req,res,next) => {
    try {
        let chats = await Chat.find()
        res.render("index" , {chats});
    } catch (err) {
        next(err)
    }
});

//New Route
app.get("/chats/new", (req,res)=>{
    // throw new ExpressError(404, "Page not found")
    res.render("new");
})

//Create Route 
app.post("/chats" , asyncWarp ( async (req,res,next)=>{
        let {from , to , msg } = req.body;
        let newChat = new Chat ({
            from: from,
            to: to,
            msg : msg,
            created_at: new Date(),
        });
        await newChat.save();
        res.redirect("/chats");
}));

function asyncWarp(fn) {
    return function (req,res,next) {
        fn(req,res,next).catch((err) => next(err))
    };
}

//New - Show Route 
app.get('/chats/:id' ,asyncWarp( async (req,res,next)=>{
        let {id} = req.params;
        let chat = await Chat.findById(id);
        if(!chat) {
            next(new ExpressError(404, "Chat not found"))
        }
        res.render("edit" , {chat});
}));

//Edit Route
app.get('/chats/:id/edit' , async (req,res)=>{
    try {
        let {id} = req.params;
        let chat = await Chat.findById(id);
        res.render("edit" , {chat});
    } catch (err) {
        next(err);
    }
})

//UPDATE Route
app.put("/chats/:id" , async (req,res)=>{
    try {
        let {id} = req.params;
    let {msg : newMsg} = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(id , {msg : newMsg} , {runValidators: true , new: true});
    console.log(updatedChat);
    res.redirect("/chats");
    } catch (err) {
        next(err);
    }
})

//Destory route
app.delete("/chats/:id" , async (req,res)=>{
    try {
        let {id} = req.params;
    let delChat = await Chat.findByIdAndDelete(id);
    console.log(delChat);
    res.redirect("/chats");
    } catch (err) {
        next(err);
    }
})

app.get("/" , (req,res)=>{
    res.send("working")
})

const handleValidationErr = (err) => {
    console.log(`This was a Validation Error. Please follow rules`);
    console.dir(err.message);
    return err;
}

app.use((err,req,res,next) => {
    console.log(err.name);
    if(err.name === "ValidationError"){
        handleValidationErr(err);
    }
    next(err);
})

//Error Handling Middleware
app.use((err,req,res,next) => {
    let {status = 500, message = "some Error Occurred"} = err;
    res.status(status).send(message);
})

app.listen(8080 , ()=> {
    console.log(`Server is working : 8080`)
})