const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    city: String,
    weather: String,
    icon: String,
    max: Number,
    min: Number
})

const CityModel = mongoose.model('weatherapp', citySchema);

module.exports = CityModel;