var socket = Primus.connect('ws://localhost:8000');

socket.on('questionReply', function (data) {
	var question = data['question'];
	console.log('question id: ' + question.id);

	$('#leftcolumn').html(question.questionText).addClass('result');
	console.log('# of answers: ' + question.answerOptions.length);

	var i;
	for (i = 0; i < question.answerOptions.length; i++) {
		var element = '#answer' + (i+1).toString();
		$(element).text(question.answerOptions[i]);
		$(element).addClass('result');
		$(element).attr('data-question-id', question.id);
		$(element).show();
	};

	//hide all the unused answer options
	for(var i = i; i <= 4; i++) {
		var element = '#answer' + (i+1).toString();
		$(element).hide();
	};
});

socket.on('helloworld', function (data) {
	console.log(data);
	$('#rightcolumn').html('hello: ' + data['hello']).addClass('result');
});

// this is called from server when ever someone connects or disconnect to the "doppel"
socket.on('clients', function (data) {
	console.log(data); //do the update of the DOM here
});

function askForQuestion() {
	socket.send('getQuestion');
}

function answerQuestion (elementId) {
	var sender = document.getElementById(elementId);
	var questionId = sender.getAttribute('data-question-id');
	var answerValue = sender.getAttribute('data-question-value');
	console.log('questionId: ' + questionId);
	console.log('answerValue: ' + answerValue);
	socket.send('answerQuestion', { id: questionId, answer: answerValue });
}
