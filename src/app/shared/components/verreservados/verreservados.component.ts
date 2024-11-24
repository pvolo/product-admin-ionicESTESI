// verreservados.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-verreservados',
  templateUrl: './verreservados.component.html',
  styleUrls: ['./verreservados.component.scss'],
})
export class VerReservadosComponent implements OnInit {
  reservados: any[] = [];
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
}
