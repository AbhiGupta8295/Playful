const mongoose = require('mongoose');

const allSongsSchema = new mongoose.Schema({
    trackid: {
        type: String,
        required: true
    },
    artists: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    track: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true 
    },

});

const AllSongs = mongoose.model('allsongs', allSongsSchema);

module.exports = AllSongs;
