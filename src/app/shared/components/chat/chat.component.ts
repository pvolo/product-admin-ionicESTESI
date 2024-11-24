// chat.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @Input() userUid: string = '';  
  @Input() productCreatorUid: string = '';  
  @Input() productCreatorName: string = '';  

  chatId: string = '';  
  messages$: Observable<any[]>;  
  messageText: string = '';  

  constructor(private firestore: AngularFirestore,
    private modalCtrl: ModalController,

  ) {}

  ngOnInit() {
   
    this.chatId = this.getChatId(this.userUid, this.productCreatorUid);
    this.loadMessages();  
  }

  
  getChatId(userUid: string, productCreatorUid: string): string {
    return userUid < productCreatorUid
      ? `${userUid}_${productCreatorUid}`
      : `${productCreatorUid}_${userUid}`;
  }


  loadMessages() {
    this.messages$ = this.firestore
      .collection(`chats/${this.chatId}/messages`, (ref) => ref.orderBy('timestamp'))
      .valueChanges(); 
  }

  
  sendMessage() {
    if (this.messageText.trim().length > 0) {
      const message = {
        senderUid: this.userUid,
        text: this.messageText,
        timestamp: new Date(),  
      };

     
      this.firestore
        .collection(`chats/${this.chatId}/messages`)
        .add(message)
        .then(() => {
          this.messageText = '';  
        })
        .catch((error) => {
          console.error('Error al enviar el mensaje: ', error);
        });
    }
  }


  closeChat() {
    this.modalCtrl.dismiss();
  }




}
