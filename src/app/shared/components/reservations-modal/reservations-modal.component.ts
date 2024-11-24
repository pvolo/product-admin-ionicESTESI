import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-reservations-modal',
  templateUrl: './reservations-modal.component.html',
  styleUrls: ['./reservations-modal.component.scss'],
})
export class ReservationsModalComponent implements OnInit {
  reservados: any[] = [];
  @Input() userUid: string = '';

  constructor(
    private modalCtrl: ModalController,
    private firebaseSvc: FirebaseService
  ) {}

  async ngOnInit() {
    if (this.userUid) {
      this.firebaseSvc.getUserReservations(this.userUid).subscribe(
        (reservados) => {
          console.log('Reservaciones obtenidas:', reservados);
          this.reservados = reservados;
        },
        (error) => {
          console.error('Error al obtener las reservaciones:', error);
        }
      );
    } else {
      console.error('No se pudo obtener el UID del usuario');
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }



  openChat(reservation: any) {
    this.modalCtrl
      .create({
        component: ChatComponent,
        componentProps: {
          userUid: this.userUid, // ID del usuario que reservó
          productCreatorUid: reservation.productCreatorUid, // ID del conductor
          productCreatorName: reservation.productCreatorName, // Nombre del conductor
        },
      })
      .then((modal) => modal.present());
  }
}
