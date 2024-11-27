import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: AngularFirestore) {}

  // Obtén los mensajes de un chat específico, ordenados por timestamp
  getMessages(chatId: string): Observable<any[]> {
    return this.firestore
      .collection(`chats/${chatId}/messages`, (ref) => ref.orderBy('timestamp'))
      .valueChanges();
  }

  // Enviar un mensaje al chat
  sendMessage(chatId: string, senderUid: string, productCreatorUid: string, text: string) {
    const message = {
      senderUid: senderUid,
      productCreatorUid: productCreatorUid,
      text: text,
      timestamp: new Date(),
    };

    return this.firestore
      .collection(`chats/${chatId}/messages`)
      .add(message);
  }
}
