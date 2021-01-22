var express = require('express');
var router = express.Router();

const UserModel = require('./model/user');

router.get(('/'), (req,res,next) => {
  res.render('login', {hasTried: req.session.hasTried});
})
.get('/login', (req,res,next) => {
  res.redirect('/');
})

router.post('/sign-up', async (req,res,next) => {

  const email_check = await UserModel.findOne({email: req.body.email});

  if (email_check) {
    //req.session.isChecked = false;
    req.session.hasTried = true;
    res.redirect("/users/login");
    return;
  }

  const newUser = new UserModel({
    username : req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  const newUserSaved = await newUser.save();
  req.session.username = newUserSaved.username;
  req.session.id = newUserSaved._id;
  
  //req.session.isChecked = true;
  req.session.isLogged = true;
  req.session.hasTried = false;
  res.redirect("/weather");
  
})


router.post('/sign-in', async (req,res,next) => {

  const login_check = await UserModel.findOne({
    email: req.body.email,
    password: req.body.password
  })
  if (login_check) {
    req.session.username = login_check.username;
    req.session.id = login_check._id;
    req.session.isLogged = true;
    res.redirect("/weather");
  } else {
    res.redirect("/users/login");
  }
})

router.get('/logout', (req,res,next) => {
  req.session.username = null;
  req.session.id = null;
  req.session.isLogged = false;
  res.redirect('/users/login');
})

module.exports = router;
