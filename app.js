var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(80);

//questions included in an external file for readability
var storage = require('./questions.js');
var questions = storage.name;

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  //sender
  // socket.emit('connection', { message: 'ok' });

  //listener
  socket.on('getQuestion', function (data) {
    console.log('client asked for a question');
    var rnd = randomIntFromInterval(0, questions.length-1);
    socket.emit('questionReply', { question: questions[rnd] });
  });

  //listener
  socket.on('message', function (data) {
    console.log(data);
  });

});

function randomIntFromInterval(min, max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
