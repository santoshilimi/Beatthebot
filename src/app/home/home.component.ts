import { Component, OnInit } from '@angular/core';
import { questions } from '../constant.file';
import { SpeechRecognitionService } from '../speech-recognition.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentQuestion: any;
  handledUserQuestionSet = [];
  handledBotQuestionSet = [];
  questionsSet = questions;
  currentBotQuestion: any;
  currentUserQuestion: any;
  botCorrectAnsCount = 0;
  usrCorrectAnsCount = 0;
  showRecord = true;
  // tslint:disable-next-line: variable-name
  recorded_message = '';
  recognition = new window.speechRecognition();

  spellUserText: any;
  constructor(public speechService: SpeechRecognitionService) { }

  ngOnInit() {
    this.currentQuestion = this.questionsSet[0];

  }
  checkTheBotAnswer() {
    const question = this.currentQuestion;
    this.speechService.getConfig([question]).subscribe(response => {
      question.tgt = response['response_body'][0].tgt;
      this.currentBotQuestion = question;
      this.handledBotQuestionSet.push(question);

    });
  }
  getNextQuestion() {
    this.currentQuestion = questions[this.currentQuestion.index + 1];
    this.currentBotQuestion = '';
    this.currentUserQuestion = '';
    this.showRecord = true;
  }

  botCorrectAns() {
    this.currentBotQuestion.botAns = 1;
    this.botCorrectAnsCount++;
  }

  botWrongAns() {
    this.currentBotQuestion.botAns = 0;
    // this.botCorrectAnsCount--;
  }
  userCorrectAns() {
    this.currentQuestion.userAns = 1;
    this.usrCorrectAnsCount++;
  }
  userWrongAns() {
    this.currentQuestion.userAns = 0;
    // this.usrCorrectAnsCount--;
  }
  getTextFromUser() {
    const question = this.currentQuestion;
    const obj = {
      'src': this.recorded_message === '' ?
        'Translate is a free multilingual machine translation service developed by Google, to translate text' : this.recorded_message,
      'id': 56,
    };
    question.src = this.recorded_message;
    this.recorded_message = "";
    this.speechService.getConfig([obj]).subscribe(response => {
      question.tgt = response['response_body'][0].tgt;
      this.currentUserQuestion = question;
      this.handledUserQuestionSet.push(question);
    });

  }
  startRecording() {
    this.showRecord = false;
    if (window.speechRecognition === undefined) {
      alert('Speech Recogniztion API Not Supported');
    }

    this.recognition.continuous = true;

    this.recognition.onerror = (error) => {
    };
    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.recorded_message = this.recorded_message.toString().concat(event.results[i][0].transcript);
        }
      }
    };
    this.recognition.onend = (event) => {
    };
    this.recognition.start();

  }

  stopRecording() {
    this.showRecord = true;
    this.recognition.stop();
    this.getTextFromUser();
  }

}


declare global {
  interface Window {
    speechRecognition: any;
    webkitSpeechRecognition: any;
    mozSpeechRecognition: any;

  }
}

window.speechRecognition = window.speechRecognition = window.speechRecognition ||
  window.webkitSpeechRecognition ||
  window.mozSpeechRecognition ||
  window.webkitSpeechRecognition;
