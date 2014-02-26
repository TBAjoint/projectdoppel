var app = require('http').createServer(handler)
  , Primus = require('primus.io')
  , path = require('path')
  , fs = require('fs');

var primus = new Primus(app, { transformer: 'socket.io', parser: 'JSON' });
  
app.listen(8080);

var gith = require('gith').create(2095);

gith().on('all', function(payload) {
  console.log('Post-receive happened!');
  var sys = require('sys')
  var exec = require('child_process').exec;
  function puts(error, stdout, stderr) { 
    sys.puts(stdout)
  };
    exec(". ~/www/deploy.sh", puts); // command to be executed
});

gith.listen();

//questions included in an external file for readability
var storage = require('./questions.js');
var questions = storage.name;

function handler (request, response) {
    console.log('request starting...');
  
  var filePath = '.' + request.url;
  if (filePath == './')
    filePath = './index.html';
    
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
  }
  
  fs.exists(filePath, function(exists) {
  
    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          response.writeHead(500);
          response.end();
        }
        else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        }
      });
    }
    else {
      response.writeHead(404);
      response.end();
    }
  });
};

var clients = [];

primus.on('connection', function (socket) {

  socket.on('getQuestion', function (data) {
    // console.log('client asked for a question');
    var rnd = randomIntFromInterval(0, questions.length-1);
    // console.log('randomized question number ' + rnd);
    socket.send('questionReply', { question: questions[rnd] });
  });

  socket.on('answerQuestion', function (data) {
    console.log('client answered question id: ' + data.id + '; answer: ' + data.answer);
  });

  socket.on('message', function (data) {
    console.log(data);
  });

  socket.on('join', function (game) {
    join(socket, game)
  });

  socket.on('leave', function (game) {
    leave(socket, game)
  });

  //add new client to connected clients array
  clients.push(socket.id);
  //send new client list to all clients (this could be optimizet that only new items are send)
  primus.send('clients', clients);

});

primus.on('disconnection', function (spark) {
  var index = clients.indexOf(spark.id);
  clients.splice(index, 1);

  // this (will be) could be optimized that only disconnetdet client is send to clients
  primus.send('clients', clients);
});

function randomIntFromInterval(min, max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

// join room
function join(socket, game) {
  socket.join(game, function () {

    // send message to this client
    socket.write('you joined game ' + game);

    // send message to all clients except this one
    socket.room(game).write(socket.id + ' joined game ' + game);
  });
}

// send to all clients in the room
function send(socket, game, message) {
  socket.room(game).write(message);
}

// leave room
function leave(socket, game) {
  socket.leave(game, function () {

    // send message to this client
    socket.write('you left game ' + game);

    // send message to all clients except this one
    socket.room(game).write(socket.id + ' left game ' + game);        
  });
}

// send to all clients in the room
function send(socket, game, message) {
  socket.room(game).write(message);
}
