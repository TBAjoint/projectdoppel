jQuery(function ($) {
  'use strict';

  var App = {
    init: function () {
		this.socket = Primus.connect('ws://localhost:8000');

     	//this is Amazon EC2 deployment
		// this.socket = Primus.connect('ws://54.72.27.146:8000');

		this.socket.on('questionReply', function (data) {
			App.renderQuestion(data);
		});

		this.socket.on('helloworld', function (data) {
			console.log(data);
			$('#rightcolumn').html('hello: ' + data['hello']).addClass('result');
		});

		this.socket.on('clients', function (data) {
			console.log(data);
		});

		this.$btnGetQuestion = $('#getquestion');
		this.$btnGetQuestion.on('click', this.askForQuestion.bind(this));


		this.$question = $('#question');
		this.$questionTemplate = Handlebars.compile($('#question-template').html());

		this.$question.on('click', '.column', this.answerQuestion.bind(this));		

    },
    renderQuestion: function (data) {
		$('#leftcolumn').html(data.question.questionText).addClass('result');
		this.$question.html(this.$questionTemplate(data.question));
    },
    askForQuestion: function () {
		this.socket.send('getQuestion');
    },
    answerQuestion: function (elementId) { 
		var sender = elementId.target;
		var questionId = sender.getAttribute('data-question-id');
		var answerValue = sender.getAttribute('data-question-value');
		console.log('questionId: ' + questionId);
		console.log('answerValue: ' + answerValue);
		this.socket.send('answerQuestion', { id: questionId, answer: answerValue });
    }
  };

  App.init();
});
