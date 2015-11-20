$('.tabgroup > div').hide();
$('.tabgroup > div:first-of-type').show();
$('.tabs a').click(function(e){
  e.preventDefault();
    var $this = $(this),
        tabgroup = '#'+$this.parents('.tabs').data('tabgroup'),
        others = $this.closest('div').siblings().children('a'),
        target = $this.attr('href');
    others.parent().removeClass('active');
    $this.parent().addClass('active');
    $(tabgroup).children('div').hide();
    $(target).show();
});

//Check Server Status
function ping(){
  var servers = ['http://localhost:3000/api', 'http://localhost:3700/', 'lol']
  var serverNames = ['API Server','Chat Server', 'Game Server'];
  for(var i = 0; i < servers.length; ++i) {
    var ajax = $.ajax({
       url: servers[i],
       serverName: serverNames[i],
       success: function(result){
          console.log('ONLINE' + this.serverName);
          $('.psummary-left').append('<img class="status online" src="./img/online.png"/><p class="serverStatus"> ' + this.serverName + '</p><br/>');
       },
       error: function(result){
           console.log('OFFLINE');
           $('.psummary-left').append('<img class="status offline" src="./img/offline.png"/><p class="serverStatus"> ' + this.serverName + '</p><br/>');
       }
    });
  }
 }
 ping();
