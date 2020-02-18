import { Component, OnInit } from '@angular/core';
import { questions } from '../constant.file';
import { SpeechRecognitionService } from '../speech-recognition.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  speechData: any;
  currentQuestion: any;
  currentUserQuestion: any;
  handledUserQuestionSet = [];
  handledBotQuestionSet = [];
  questionsSet = questions;
  currentBotQuestion: any;
  botCorrectAnsCount = 0;
  usrCorrectAnsCount = 0;
  // tslint:disable-next-line: variable-name
  recorded_message = '';
  recognition = new window.speechRecognition();

  spellUserText: any;
  constructor(public speechService: SpeechRecognitionService) { }

  ngOnInit() {
    console.log(questions);
    this.currentQuestion = questions[0];

  }
  checkTheBotAnswer() {
    this.speechService.getConfig([this.currentQuestion]).subscribe(response => {
      console.log(response, 'response');
      this.currentQuestion.tgt = response['response_body'][0].tgt;
      this.currentBotQuestion = this.currentQuestion;
      this.handledBotQuestionSet.push(this.currentQuestion);

    });
  }
  getNextQuestion() {
    this.currentQuestion = questions[this.currentQuestion.index + 1];
    this.currentBotQuestion = '';
    this.currentUserQuestion = '';
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
  getSpeechTextFromUser() {
    console.log('getSpeechTextFromUser');
    const obj = {
      'src': this.spellUserText,
      'id': 56,
    };
    console.log(obj, 'obj');
    this.speechService.getConfig([obj]).subscribe(response => {
      console.log(response, 'response');
      this.currentQuestion.tgt = response['response_body'][0].tgt;
      this.currentUserQuestion = this.currentQuestion;
      this.handledUserQuestionSet.push(this.currentQuestion);
    });
  }
  startRecording() {
    if (window.speechRecognition === undefined) {
      alert('Speech Recogniztion API Not Supported');
    }

    this.recognition.continuous = true;

    this.recognition.onerror = (error) => {
      console.log("error" + error);
    };
    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.recorded_message = this.recorded_message.toString().concat(event.results[i][0].transcript);
        }
      }
    };
    this.recognition.onend = (event) => {
      console.log('end' + event);
    };
    this.recognition.start();
    console.log('recorded_message', this.recorded_message);
  }

  stopRecording() {
    this.recognition.stop();
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
