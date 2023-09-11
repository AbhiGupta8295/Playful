const mongoose = require('mongoose');

const allusers = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, { versionKey: false });

const Users = mongoose.model('users', allusers);

module.exports = Users;