const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    url: String,
    short_url: Number,
});

const Url = mongoose.model('Url', urlSchema);

module.exports = Url