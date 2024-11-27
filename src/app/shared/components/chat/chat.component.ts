import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
  @Input() isSenderUser: boolean = false;  // Recibimos el parámetro que indica quién es el emisor

  chatId: string = '';
  messages$: Observable<any[]>;
  messageText: string = '';

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.chatId = this.getChatId(this.userUid, this.productCreatorUid);
    this.loadMessages();
  }

  getChatId(userUid: string, productCreatorUid: string): string {
    return `${userUid}_${productCreatorUid}`;
  }

  loadMessages() {
    this.messages$ = this.firestore
      .collection(`chats/${this.chatId}/messages`, (ref) => ref.orderBy('timestamp'))
      .valueChanges();
  }

  sendMessage() {
    if (this.messageText.trim().length > 0) {
      const senderUid = this.isSenderUser ? this.userUid : this.productCreatorUid;  // Determinamos quién es el emisor
      const message = {
        senderUid: senderUid,
        productCreatorUid: this.productCreatorUid,
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
    this.firestore
      .collection(`chats/${this.chatId}/messages`)
      .add({ text: 'Chat cerrado', timestamp: new Date() })
      .then(() => {
        this.firestore.collection(`chats/${this.chatId}/messages`).get();
      });
  }
}
