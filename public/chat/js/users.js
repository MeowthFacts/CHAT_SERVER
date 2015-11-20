$(function() {
  var FADE_TIME = 150; // ms
  var numUsers = 0;
  var users = {};
  var socket = io('localhost:3700/user-list');

  var $userList = $('.user-list');

  var users;
  var numUsers = 0;


  function init() {
    socket.emit()
  }
  function updateUserList(users) {
    var $list = $('<ul class="user-list"/>');
    for(var i = 0; i < users.length; i++) {


      // Create the list item:
      var item = '<li class="user">' + users[i] + '</li>';
      // Add it to the list:
      $list.append(item);
    }
    console.log($userList);
    console.log($list);
    $userList.replaceWith($list);
    $userList = $('.user-list');

  }

  socket.on('user list', function (data) {
    console.log('Got user List');
    console.log(data);
    users = data.users;
    numUsers = data.numUsers;
    updateUserList(users);
  });

});
