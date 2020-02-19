import { Component, OnInit, OnDestroy } from '@angular/core';
import { questions } from '../constant.file';
import { SpeechRecognitionService } from '../speech-recognition.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
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
  nextCount = 1;
  nextButtonname: any;
  questionSetNumber: any;
  // tslint:disable-next-line: variable-name
  recorded_message = '';
  recognition = new window.speechRecognition();

  spellUserText: any;
  public unsubscribe$ = new Subject<void>();
  constructor(public speechService: SpeechRecognitionService, public router: Router) { }

  ngOnInit() {
    this.questionSetNumber = Math.floor(Math.random() * 4);
    console.log(this.questionSetNumber, 'questionSetNumber');
    console.log(this.questionsSet, 'questionsSet');

    this.currentQuestion = this.questionsSet[this.questionSetNumber][0];
    console.log(this.currentQuestion, 'currentQuestion');

    this.recognition.lang = 'hi';
    this.nextButtonname = 'NEXT';
  }
  goToLandingPage() {
    this.router.navigate(['/landing']);
  }
  checkTheBotAnswer() {
    const question = this.currentQuestion;
    this.speechService.getConfig([question])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        question.tgt = response['response_body'][0].tgt;
        this.currentBotQuestion = question;
        // this.handledBotQuestionSet.push(question);

      });
  }
  getNextQuestion() {
    console.log(this.currentQuestion, 'this.currentQuestion');

    if (this.nextCount >= 6) {
      if (this.usrCorrectAnsCount === this.botCorrectAnsCount) {
        alert('Tie');
        this.router.navigate(['/landing']);

      } else if (this.usrCorrectAnsCount > this.botCorrectAnsCount) {
        alert('congratulation you are the Winner');
        this.router.navigate(['/landing']);

      } else {
        alert('Winner is Bot');
        this.router.navigate(['/landing']);

      }
    } else {
      this.currentQuestion = this.questionsSet[this.questionSetNumber][this.nextCount];
      this.handledBotQuestionSet.push(this.currentBotQuestion);
      this.handledUserQuestionSet.push(this.currentUserQuestion);
      this.nextCount++;
      if (this.handledBotQuestionSet.length === 5) {
        this.nextButtonname = 'SHOW WINNER';
      }
      console.log(this.nextCount, 'this.nextCount');

      console.log(this.handledUserQuestionSet, 'this.handledUserQuestionSet');
      console.log(this.handledBotQuestionSet, 'this.handledBotQuestionSet');


      this.currentBotQuestion = '';
      this.currentUserQuestion = '';
      this.showRecord = true;
    }
  }

  botCorrectAns() {
    this.currentBotQuestion.botAns = 1;
    this.botCorrectAnsCount++;
  }

  botWrongAns() {
    this.currentBotQuestion.botAns = 0;
    // if (this.botCorrectAnsCount) {
    //   this.botCorrectAnsCount--;
    // }
  }
  userCorrectAns() {
    this.currentUserQuestion.userAns = 1;
    this.usrCorrectAnsCount++;
  }
  userWrongAns() {
    this.currentUserQuestion.userAns = 0;
    // if (this.usrCorrectAnsCount) {
    // this.usrCorrectAnsCount--;
    // }
  }
  getTextFromUser() {
    const obj = {
      src: 'Hi hello',
      "id": 56,
      "index": 2,
      "userAns": '',
      "botAns": ''
    };
    this.currentUserQuestion = obj;
    this.recorded_message = "";

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
