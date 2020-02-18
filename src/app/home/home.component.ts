import { Component, OnInit, OnDestroy } from '@angular/core';
import { questions } from '../constant.file';
import { SpeechRecognitionService } from '../speech-recognition.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
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
  public unsubscribe$ = new Subject<void>();
  constructor(public speechService: SpeechRecognitionService) { }

  ngOnInit() {
    this.currentQuestion = this.questionsSet[0];

  }
  checkTheBotAnswer() {
    const question = this.currentQuestion;
    this.speechService.getConfig([question])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        question.tgt = response['response_body'][0].tgt;
        this.currentBotQuestion = question;
        this.handledBotQuestionSet.push(question);

      });
  }
  getNextQuestion() {
    this.currentQuestion = this.questionsSet[this.currentQuestion.index + 1];
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
    this.currentUserQuestion.userAns = 1;
    this.usrCorrectAnsCount++;
  }
  userWrongAns() {
    this.currentUserQuestion.userAns = 0;
    // this.usrCorrectAnsCount--;
  }
  getTextFromUser() {
    const obj = {
      src: this.recorded_message,
      "id": 56,
      "index": 2,
      "userAns": '',
      "botAns": ''
    };
    // question.src = this.recorded_message;
    this.recorded_message = "";
    this.speechService.getConfig([obj])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        obj['tgt'] = response['response_body'][0].tgt;
        this.currentUserQuestion = obj;
        this.handledUserQuestionSet.push(obj);
      });

  }
  startRecording() {
    this.recorded_message = "";
    this.showRecord = false;
    if (window.speechRecognition === undefined) {
      alert('Speech Recogniztion API Not Supported');
    }

    this.recognition.continuous = true;

    this.recognition.onerror = (error) => {
    this.recorded_message = "";
    };
    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.recorded_message = this.recorded_message.toString().concat(event.results[i][0].transcript);
          console.log(this.recorded_message, 'recorded_message');
        }
      }
    };
    this.recognition.onend = (event) => {
    };
    this.recognition.start();
    console.log(this.recorded_message, 'recorded_message');
  }

  stopRecording() {
    this.showRecord = true;
    this.recognition.stop();
    this.getTextFromUser();
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
