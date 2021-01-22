var express = require('express');
var router = express.Router();
const request = require('sync-request');

const CityModel = require('./model/cities');

router.get('/', (req,res,next) => {
  res.redirect('/users');
})


router.get(('/weather'), async (req,res,next) => {

  if (!req.session.isLogged) {
    res.redirect('/users');
    return;
  }

  let cityList = await CityModel.find();
  res.render('weather', {
    cityList,
    error: false
  });
})

router.post('/add-city', async (req,res,next) => {
  
  const check = await CityModel.findOne({city: req.body.city_name.toLowerCase()});
  
  
  if (check) {
    res.redirect('/weather');
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
    min: weatherResult.main.temp_min,
    lat: weatherResult.coord.lat,
    lon: weatherResult.coord.lon
  })

  const citySaved = await newCity.save();

  res.redirect('/weather');
})

router.get('/delete-city', async (req,res,next) => {
  
  await CityModel.deleteOne({city: req.query.city});

  res.redirect('/weather');
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

res.redirect('/weather');  

})

module.exports = router;
