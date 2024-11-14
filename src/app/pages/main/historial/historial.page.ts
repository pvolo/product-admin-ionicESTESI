
import { ReservationsModalComponent } from 'src/app/shared/components/reservations-modal/reservations-modal.component'; 
import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Observable } from 'rxjs';
import { VehicleComponent } from 'src/app/shared/components/vehicle/vehicle.component';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  modalCtrl = inject(ModalController);
  userUid$: Observable<string | null> = this.firebaseSvc.getCurrentUserUid();
  constructor(private modalController: ModalController) {}
  ngOnInit() {}


  async openReservationsModal() {
    this.userUid$.subscribe((userUid) => {
      if (!userUid) {
        console.error('No hay un usuario autenticado');
        return;
      }
      this.modalCtrl.create({
        component: ReservationsModalComponent,
        componentProps: {
          userUid: userUid,
        },
      }).then((modal) => modal.present());
    });
  }
  
  async openVehicleModal() {
    const modal = await this.modalController.create({
      component: VehicleComponent,
    });
    return await modal.present();
  }



}