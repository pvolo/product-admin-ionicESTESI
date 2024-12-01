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
    const storedReservations = localStorage.getItem('userReservations');
    if (storedReservations) {
      this.reservados = JSON.parse(storedReservations);
      console.log('Reservaciones cargadas desde localStorage:', this.reservados);
    } else {
      this.firebaseSvc.getUserReservations(this.userUid).subscribe(
        (reservados) => {
          console.log('Reservaciones obtenidas:', reservados);
          this.reservados = reservados;

          localStorage.setItem('userReservations', JSON.stringify(reservados));
        },
        (error) => {
          console.error('Error al obtener las reservaciones:', error);
        }
      );
    }
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
          userUid: reservation.userUid,  // UID del usuario que hizo la reserva
          productCreatorUid: reservation.productCreatorUid,  // UID del creador del producto/viaje
          productCreatorName: reservation.productCreatorName,  // Nombre del conductor
          isSenderUser: true,  // El usuario que reservó está enviando el mensaje
        },
      })
      .then((modal) => modal.present());
  }
  
}
