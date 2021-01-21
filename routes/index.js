var express = require('express');
var router = express.Router();
const request = require('sync-request');

const CityModel = require('./model/cities');
const UserModel = require('./model/user');

router.get(('/'), (req,res,next) => {
  res.render('login', {isChecked: req.session.isChecked});
})
.get('/login', (req,res,next) => {
  res.redirect('/');
})

router.post('/sign-up', async (req,res,next) => {

  const email_check = await UserModel.findOne({email: req.body.email});

  if (email_check) {
    req.session.isChecked = false;
    res.redirect("/login");
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
  
  req.session.isChecked = true;
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
    res.redirect("/weather");
  } else {
    res.redirect("/login");
  }
})

router.get('/logout', (req,res,next) => {
  req.session.username = null;
  req.session.id = null;
  res.redirect('/login');
})

router.get(('/weather'), async (req,res,next) => {
  let cityList = await CityModel.find();
  res.render('weather', {
    cityList,
    error: false
  });
})

router.post('/add-city', async (req,res,next) => {
  
  const check = await CityModel.findOne({city: req.body.city_name.toLowerCase()});
  
  
  if (check) {
    
    
    res.render('weather', {
      cityList : await CityModel.find(),
      error: false
    });
    return;
  }

  const result = request("GET",'https://api.openweathermap.org/data/2.5/weather?q='+req.body.city_name+'&appid='+process.env.WEATHER_API_KEY+'&units=metric&lang=fr');

  if ( result.statusCode == 404) {
    res.render('weather', {
      cityList : await CityModel.find(),
      error: true
    });
    return;
  }

  const weatherResult = JSON.parse(result.getBody());
  
  const newCity = new CityModel({
    city: weatherResult.name.toLowerCase(),
    weather: weatherResult.weather[0].description,
    icon: "http://openweathermap.org/img/wn/"+ weatherResult.weather[0].icon +".png",
    max: weatherResult.main.temp_max,
    min: weatherResult.main.temp_min
  })

  const citySaved = await newCity.save();

  res.render('weather', {
    cityList : await CityModel.find(),
    error: false
  })
})

router.get('/delete-city', async (req,res,next) => {
  
  await CityModel.deleteOne({city: req.query.city});

  res.render('weather', {
    cityList: await CityModel.find(),
    error: false
  })
})

router.get('/update-cities-data', async (req,res,next) => {
  const cities_data = await CityModel.find();

  for (let r = 0; r < cities_data.length; r++) {
    const result = request("GET",'https://api.openweathermap.org/data/2.5/weather?q='+cities_data[r].city+'&appid='+process.env.WEATHER_API_KEY+'&units=metric&lang=fr');
    const weatherResult = JSON.parse(result.getBody());
    await CityModel.updateOne({_id: cities_data[r]._id}, {
      weather: weatherResult.weather[0].description,
      icon: "http://openweathermap.org/img/wn/"+ weatherResult.weather[0].icon +".png",
      max: weatherResult.main.temp_max,
      min: weatherResult.main.temp_min
    })
}

  res.render('weather', {
    cityList: await CityModel.find(),
    error: false
  })

})

module.exports = router;
