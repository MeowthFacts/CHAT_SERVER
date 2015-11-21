var express = require("express");
var app = express();
var server = require('http').Server(app);
var request = require('request');
var port = 3700;
var io = require('socket.io')(server);
var chat = require('./chat/chat').chat(io, request)

server.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

//Static Webpage Routing
app.use('/chat',  express.static(__dirname + '/public/chat'));
app.use('/js',  express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public'));
