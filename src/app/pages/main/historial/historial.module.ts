import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialPageRoutingModule } from './historial-routing.module';
import { ReservationsModalComponent } from 'src/app/shared/components/reservations-modal/reservations-modal.component'; // Importa el modal

import { HistorialPage } from './historial.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialPageRoutingModule,
    SharedModule
  ],
  declarations: [HistorialPage,ReservationsModalComponent]
})
export class HistorialPageModule {}
