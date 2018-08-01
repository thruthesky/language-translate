import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AppService } from '../../providers/app.service';
import { PhilGoApiService } from '../../modules/philgo-api-v3/philgo-api.module';
import {
  ApiChatMessage, ApiChatRoomEnter, ApiChatRoom, CHAT_STATUS_ENTER, ERROR_CHAT_NOT_IN_THAT_ROOM
} from '../../modules/philgo-api-v3/philgo-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit, OnDestroy {

  @ViewChild('ionScroll') ionScroll;

  countMessageSent = 0;
  roomInfo: ApiChatRoomEnter = <any>{};
  form: ApiChatMessage = <any>{};
  messages: Array<ApiChatMessage> = [];

  subscriptionNewMessage = null;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public actionSheetController: ActionSheetController,
    private alertController: AlertController,
    public a: AppService,
    public philgo: PhilGoApiService
  ) {
    console.log(' ==> RoomPage::constructor()');

    /**
     * @desc 채팅 방 부터 먼저 접속한 경우, 로비로 갔다가 다시 오면, life cyle 이벤트가 발생하지 않는다.
     *  이것은 기존 컴포넌트 인스턴스 어딘가에 살아 있다는 뜻이다.
     *  따라서, 기존 subscription 사용하고 새로 만들지 않는다.
     */
    if (this.subscriptionNewMessage) {
      console.log(' ==> Unsubscribing new message');
      this.subscriptionNewMessage.unsubscribe();
    }
    console.log(' ===> Going to subscribe new message event!');
    this.subscriptionNewMessage = a.newMessageOnCurrentRoom.subscribe(message => {
      console.log(` ==> RoomPage::constructor() => Got new message in ${this.roomInfo.name} : you should see it on chat box.`,
        message, CHAT_STATUS_ENTER, this.philgo.myIdx());
      this.displayMessage(message);
    });
  }

  ngOnInit() {
    console.log('   ===> RoomPage::ngOnInit()');
  }

  ngOnDestroy() {
    console.log('   ===> RoomPage::ngOnDestroy()');
    this.leaveRoom();
  }

  ionViewDidEnter() {
    console.log('   ===> RoomPage::ionViewDidEnter()');
    this.messages = [];
    this.loadChatRoomEnter();
  }
  ionViewWillLeave() {
    console.log('   ===> RoomPage::ionViewWillLeave()');
    // this.leaveRoom();
  }

  test() {
    for (let i = 0; i < 100; i++) {
      this.form.message = 'message No. ' + i;
      console.log('sending message: ', i);
      this.onClickSendMessage();
    }

  }
  leaveRoom() {
    if (this.messages && this.messages.length) {
      this.messages = [];
    }
    this.a.currentRoomNo = 0;
    if (this.subscriptionNewMessage) {
      console.log(' ==> New message unsubscribed !!');
      this.subscriptionNewMessage.unsubscribe();
      this.subscriptionNewMessage = null;
    }
  }

  loadChatRoomEnter() {
    setTimeout(() => {
      // console.log('loadChatRoomEnter() setTimeout()');
      this.activatedRoute.paramMap.subscribe(params => {
        const idx = params.get('idx_chat_room');
        if (idx) {
          this.form.idx_chat_room = idx;
          this.a.currentRoomNo = parseInt(this.form.idx_chat_room, 10);
          this.philgo.chatRoomEnter({ idx: this.form.idx_chat_room }).subscribe(res => {
            // console.log('info: ', res);
            this.roomInfo = res;
            if (this.roomInfo.messages && this.roomInfo.messages.length) {
              this.roomInfo.messages.reverse().map(v => this.displayMessage(v));
            }
            // this.messages = this.roomInfo.messages.reverse();
            this.scroll();
            const room: ApiChatRoom = <any>this.roomInfo;
            delete room['messages'];
            this.a.addRoomToListen(room);
            // this.test();
          }, e => this.a.toast(e));
        } else {
          this.a.toast('Chat room number was not provided.');
        }
      });
    }, 100);
  }
  scroll() {
    setTimeout(() => {
      this.ionScroll.nativeElement.scrollToBottom(30);
    }, 100);
  }

  onClickSendMessage() {
    if (!this.form.message) {
      console.log('empty form.message. return');
      return;
    }
    console.log('form: ', this.form);
    this.form.idx_member = this.philgo.idx().toString();
    this.form.retvar = ++this.countMessageSent;
    const m = Object.assign({}, this.form);
    this.messages.push(m);
    this.form.message = '';
    // this.a.render();
    this.scroll();
    // console.log('messages: ', this.messages);
    this.philgo.chatMessageSend(m).subscribe(res => {
      console.log('message sent: ', res);
      // this.form.message = '';
      // this.messages.push(res);
      m.idx = res.idx;
    }, e => this.a.toast(e));
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Options',
      buttons: [{
        text: 'Leave Chat Room',
        role: 'destructive',
        icon: 'trash',
        handler: async () => {
          console.log('Room leave clicked');

          const alert = await this.alertController.create({
            header: 'Leave',
            message: 'Do you want to leave this room?',
            buttons: [
              {
                text: 'No',
                role: 'no',
                cssClass: 'secondary',
                handler: (blah) => {
                  console.log('Confirm Cancel: blah');
                }
              }, {
                text: 'Yes',
                role: 'yes',
                handler: () => {
                  console.log('Confirm Okay');
                }
              }
            ]
          });
          alert.present();
          const re = await alert.onDidDismiss();
          console.log('result of present: ', re.role);

          if ( re.role === 'no' ) {
            return;
          }

          this.philgo.chatRoomLeave(this.roomInfo.idx).subscribe(res => {
            console.log('You have successfully left the room: ', res.name);
            this.router.navigateByUrl('/my-rooms');
          }, e => {
            if (e.code !== void 0 && e.code === ERROR_CHAT_NOT_IN_THAT_ROOM) {
              this.router.navigateByUrl('/my-rooms');
            } else {
              this.a.toast(e);
            }
          });
        }
      },
      // {
      //   text: 'Share',
      //   icon: 'share',
      //   handler: () => {
      //     console.log('Share clicked');
      //   }
      // },
      {
        text: 'Favorite',
        icon: 'heart',
        handler: () => {
          console.log('favorite clicked');
          this.a.toast('This room has added as favorite');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  displayMessage(message: ApiChatMessage) {
    if (message.status === CHAT_STATUS_ENTER && message.idx_member === this.philgo.myIdx()) {
      // if it's a greeting message for my entering, then no need to show it to myself.
    } else {
      this.messages.push(message);
      this.scroll();
    }
  }
}

