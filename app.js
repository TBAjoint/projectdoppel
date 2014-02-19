var app = require('http').createServer(handler)
  , Primus = require('primus.io')
  , fs = require('fs');

var primus = new Primus(app, { transformer: 'sockjs', parser: 'JSON' });

app.listen(8000);

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

primus.on('connection', function (socket) {
  //sender
  // socket.emit('connection', { message: 'ok' });

  //listener
  socket.on('getQuestion', function (data) {
    console.log('client asked for a question');
    var rnd = randomIntFromInterval(0, questions.length-1);
    socket.send('questionReply', { question: questions[rnd] });
  });

  socket.on('answerQuestion', function(data) {
    console.log('client answered question id: ' + data.id + '; answer: ' + data.answer);
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
