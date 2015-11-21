module.exports.chat = function(io, request) {
  var cmds = require('./commands').commands(io, request);

  //get usernames from game server with player_id
  var users = {};
  var numUsers = 0;
  //Colors for users, assigned to socket when user connects
  var userColors = ['#000', '#f00']
  function unpad(str) {
    str = str.toString();
    str = str.substring(2);
    return parseInt(str);
  };


  //###########################################################################
  //THIS SOCKET IS ONLY USED TO SEND THE USER LIST BACK AND FORTH,
  //THE MAIN SOCKET UTILIZES THE FUNCTION sendUserList TO USE THIS SOCKET!
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

  //###########################################################################

  //###########################################################################
  //THIS IS THE MAIN CHAT SOCKET!

  io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    // must pass 'new message' to trigger new message.
    socket.on('new message', function (data) {
      // we tell the client to execute 'new message'
      var isCMD = false;
      isCMD = processCMD(socket, data);
      if(!isCMD) {
        socket.broadcast.emit('new message', {
          username: socket.username,
          message: data,
          timestamp: Date.now()
        });
      }
      console.log('I sent it');
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (player_id) {
      //USER ATTEMPTING TO CONNECT via player_id
      request('http://localhost:3000/api/players/id/' + player_id, function (error, response, body) {
        var username;
        var user;
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body);
          if(body.player_id) {
            console.log('found player');
            if(users[body.username] === undefined){
              username = body.username;
              user = body;
            }else {
              console.log('player already joined - rejected');
              socket.emit('login error', {
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
          socket.role = user.role;
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
        }else {
          socket.emit('login error', {
            error: 'Server Offline'
          });
          socket.disconnect();
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
        socket.disconnect();
      }
    });
  });

  //takes in data, socket, and users - discovers which cmd
  //is being uses and executes it
  function processCMD(socket, data) {
    var cmd;
    var args;

    if(data[0] === '/') {
      //(get CMD
      cmd = data.substr(1, data.indexOf(' ') - 1);
      var index = (cmds.cmdsN).indexOf(cmd);
      if(index > -1 ) {
        console.log(index);
        //gets args
        args = data.substr(data.indexOf(' ') + 1);
        //run args
        if(! cmds.cmdsF[index](args, socket, users) ) {
          socket.emit('bad command', {
            error: "Entered Bad Command"
          });
        }
        return true;
      }
    }
    return false;
  }



  return io;
}
