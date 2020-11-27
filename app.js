//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const port = 3000;
const passport = require('passport');
const passportLocal = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: 'Our Little Secret',
    resave: false,
    saveUninitialized: true
  }))
  
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB" , {useUnifiedTopology : true , useNewUrlParser : true});

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

var secret = process.env.SECRET;
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User" , userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req , res){
    res.render("home");
});
app.get("/login", function(req , res){
    res.render("login");
});
app.post("/login", function(req, res){
    const user = new User({
    username : req.body.username,
    password : req.body.password
});

req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
    }  
});
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});
app.get("/register", function(req, res){
    res.render("register");
  });
app.get("/secrets", function(req , res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.render("/login");
    }
});
app.post("/register", function(req , res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
      });
      
  
});

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
    
});
