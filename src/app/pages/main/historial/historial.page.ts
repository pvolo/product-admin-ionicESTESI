
import { ReservationsModalComponent } from 'src/app/shared/components/reservations-modal/reservations-modal.component'; 
import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Observable } from 'rxjs';  // Necesario para manejar los observables

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  firebaseSvc = inject(FirebaseService);  // Inyectamos FirebaseService
  modalCtrl = inject(ModalController);  // Inyectamos ModalController

  userUid$: Observable<string | null> = this.firebaseSvc.getCurrentUserUid();  // Aquí obtenemos el UID como un observable

  constructor() {}

  ngOnInit() {}

  async openReservationsModal() {
    this.userUid$.subscribe((userUid) => {
      if (!userUid) {
        console.error('No hay un usuario autenticado');
        return;
      }

      // Pasamos el userUid como parte de componentProps al modal
      this.modalCtrl.create({
        component: ReservationsModalComponent,
        componentProps: {
          userUid: userUid,  // Pasamos el UID al modal
        },
      }).then((modal) => modal.present());
    });
  }
}