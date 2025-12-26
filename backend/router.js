const express = require('express');
let AuthAPI = require('./server/auth');
let UsersAPI = require('./server/users');
let WorkoutsAPI = require('./server/workouts');
let ChatAPI = require('./server/chat');

function init (io) {
    let api = express.Router();

    api.use('/auth', AuthAPI());
    api.use('/users', UsersAPI(io));
    api.use('/workouts', WorkoutsAPI(io));
    api.use('/chat', ChatAPI(io));

    return api;
}

module.exports = {
    init: init,
}