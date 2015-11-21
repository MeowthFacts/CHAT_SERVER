module.exports.commands = function(io, request)  {
  var cmds = {};
  cmds.cmdsN = ["kick", "leave", "join"];

  var kickPlayer = function(args, socket, users) {
    //if args only contains 1 argument (aka: 1 user)
    if(args.indexOf(' ') === -1) {
      if(users[args]) {
        console.log('kicked player ' + users[args].username);
        adminMessage(socket, 'Player ' + users[args].username + ' has been kicked');
        users[args].disconnect();
        return true;
      }else {
        adminMessage(socket, 'Player not online');
      }
    }else {
      adminMessage(socket, 'Invalid set of arguments');

    }
    return false
  }

  var banPlayer = function(args, socket, users) {
    return true;
  }

  var leaveRoom = function(args, socket, users) {
    return true;
  }

  var joinRoom = function(args, socket, users) {
    return true;
  }

  var adminMessage = function(socket, error) {
    socket.emit('new message', {
      username: '[ADMIN]:Server',
      message: error,
      timestamp: Date.now()
    });
  }
  cmds.cmdsF = [kickPlayer, leaveRoom, joinRoom];

  return cmds;
}
