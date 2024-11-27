// verreservados.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-verreservados',
  templateUrl: './verreservados.component.html',
  styleUrls: ['./verreservados.component.scss'],
})
export class VerReservadosComponent implements OnInit {
  reservados: any[] = [];
  @Input() userUid: string = '';
  @Input() productCreatorUid: string = '';

  constructor(
    private modalCtrl: ModalController,
    private firebaseSvc: FirebaseService
  ) {}

  async ngOnInit() {
    if (this.productCreatorUid) {
      this.firebaseSvc.getReservationsForConductor(this.productCreatorUid).subscribe(
        (reservados) => {
          console.log('Reservaciones obtenidas para conductor:', reservados);
          this.reservados = reservados;
        },
        (error) => {
          console.error('Error al obtener las reservaciones:', error);
        }
      );
    } else {
      console.error('No se pudo obtener el UID del conductor');
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
          userUid: reservation.userUid,  // UID del usuario que reservó
          productCreatorUid: reservation.productCreatorUid,  // UID del conductor que aceptó la reserva
          productCreatorName: reservation.productCreatorName,  // Nombre del conductor
          isSenderUser: false,  // El conductor está enviando el mensaje
        },
      })
      .then((modal) => modal.present());
  }
  

}
