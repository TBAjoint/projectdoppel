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

		this.socket.on('clients', function (data) {
			App.renderPlayas(data);
		});

		// bind onclick event for getquestion button
		this.$btnGetQuestion = $('#getquestion');
		this.$btnGetQuestion.on('click', this.askForQuestion.bind(this));

		// bind onclick event for answer buttons
		this.$question = $('#question');
		this.$question.on('click', '.column', this.answerQuestion.bind(this));
		
		// precompile question template
		this.$questionTemplate = Handlebars.compile($('#question-template').html());

		// precompile playas template
		this.$playas = $('#playas');
		this.$playasTemplate = Handlebars.compile($('#playas-template').html());
    },
    renderQuestion: function (data) {
		$('#leftcolumn').html(data.question.questionText).addClass('result');
		this.$question.html(this.$questionTemplate(data.question));
    },
    renderPlayas: function (data) {
		this.$playas.html(this.$playasTemplate(data));
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
