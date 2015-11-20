$(function() {
  var FADE_TIME = 150; // ms


  var $window = $(window);
  var $loginUser = $('.usernameInput');
  var $loginPage = $('.login.page');
  var $chatPage = $('.chat.page');
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage');

  var username;
  var connected = false;
  var numUsers = 0;

  var socket = io();

  console.log($window);
  //Clicking anywhere on the login page
  //will focus on the input box
  $loginPage.click(function () {
    $loginUser.focus();
  });

  //ENTER KEY PRESSED -
  //SET USERNAME OR SEND MESSAGE
  $window.keydown(function (event) {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      console.log('Enter')
      if (username) {
        console.log('M')
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        console.log('U')
        setUsername();
      }
    }
  });


  function setUsername() {
    username = cleanInput($loginUser.val().trim());

    if(username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');

      //tell socket you're username
      socket.emit('add user', username);
    }

  }

  function sendMessage() {
      var message = $inputMessage.val();
      message = cleanInput(message);
      console.log(message);
      if(message) {
        $inputMessage.val('');
        addChatMessage({
          username: username,
          message: message
        });
        socket.emit('new message', message);
      }

  }
  // Adds the visual chat message to the message list
function addChatMessage (data, options) {
  // Don't fade the message in if there is an 'X was typing'

  options = options || {};

  var $usernameDiv = $('<span class="username"/>')
    .text(data.username)
    .css('color', '#fff');
  var $messageBodyDiv = $('<span class="messageBody">')
    .text(data.message);

  var $messageDiv = $('<li class="message"/>')
    .data('username', data.username)
    .append($usernameDiv, $messageBodyDiv);

  addMessageElement($messageDiv, options);
}

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }


  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  socket.on('login', function (data) {
    console.log(username = data.username);
    numUsers = data.numUsers;
  });


  socket.on('user joined', function (data) {
    console.log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  socket.on('new message', function (data) {
    console.log(data.message);
    addChatMessage(data, {});
  });

});
