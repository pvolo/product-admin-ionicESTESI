import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-reservations-modal',
  templateUrl: './reservations-modal.component.html',
  styleUrls: ['./reservations-modal.component.scss'],
})
export class ReservationsModalComponent implements OnInit {
  reservations: any[] = [];
  @Input() userUid: string = '';
  constructor(
    private modalCtrl: ModalController,
    private firebaseSvc: FirebaseService
  ) {}
  async ngOnInit() {
    if (this.userUid) {
      this.firebaseSvc.getUserReservations(this.userUid).subscribe(reservations => {
        console.log('Reservaciones obtenidas:', reservations);
        this.reservations = reservations;
      }, error => {
        console.error('Error al obtener las reservaciones:', error);
      });
    } else {
      console.error('No se pudo obtener el UID del usuario');
    }
  }
  close() {
    this.modalCtrl.dismiss();
  }
  
}