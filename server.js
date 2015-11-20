var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');
var port = 3700;


server.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
});
app.use(function(req, res, next) {
        console.log('Request made');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        next();
    });
//Routing
app.use('/chat',  express.static(__dirname + '/public/chat'));
app.use('/js',  express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public'));


//get usernames from game server with player_id
var users = {};
var numUsers = 0;
function unpad(str) {
  str = str.toString();
  str = str.substring(2);
  return parseInt(str);
};



  //SETTING UP USER-LIST NAME SPACE TO JUST RECEIVE ONLINE PLAYERS
  var ulio = io.of('/user-list');

  ulio.on('connection', function(ulsocket){
    console.log('getting user list');
    sendUserList();

    ulsocket.on('user list', function() {
        console.log('user connected');
    })

  });

  function sendUserList() {
    ulio.emit('user list', {
      numUsers: numUsers,
      users: Object.keys(users)
    });
  }



io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  // must pass 'new message' to trigger new message.
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
      timestamp: Date.now()
    });
    console.log('I sent it');
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (player_id) {
    //USER ATTEMPTING TO CONNECT via player_id
    request('http://localhost:3000/api/players/id/' + player_id, function (error, response, body) {
      var username;
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
        if(body.player_id) {
          console.log('found player');
          if(users[body.email_id] === undefined){
            username = body.email_id;
          }else {
            console.log('player already joined - rejected');
            socket.emit('login failed', {
              error: 'already logged in'
            });
            socket.disconnect();
            return;
          }
        }
        if(!username) {
          username = "guest_" + player_id;
        }

        // we store the username in the socket session for this client
        socket.player_id = player_id;
        socket.username = username;
        console.log('User: ' + username + ' joined');
        // add the client's username to the global list
        users[username] = socket;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
          username: socket.username,
          numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        io.sockets.emit('user joined', {
          username: socket.username,
          numUsers: numUsers
        });
        //send our userlist
        sendUserList();
      }
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('get users', function () {
    sockets.broadcast.emit('current users', {
      users: Object.keys(users)
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete users[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
      //retransmit userlist after user has been deleted
      sendUserList();

    }
  });
});
