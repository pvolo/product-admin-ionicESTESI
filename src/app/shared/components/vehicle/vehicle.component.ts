import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { VehicleService } from '../../../services/vehicle.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyVehiclesModalComponent } from '../my-vehicles-modal/my-vehicles-modal.component';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
})
export class VehicleComponent {
  vehicleForm: FormGroup;

  constructor(
    private vehicleService: VehicleService,
    private fb: FormBuilder,
    private modalController: ModalController

  ) {
    this.vehicleForm = this.fb.group({
      matricula: ['', [Validators.required,Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern('^[A-Za-z0-9]{6}$')]],
      nameCar: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.vehicleForm.valid) {
      const { matricula, nameCar } = this.vehicleForm.value;
      await this.vehicleService.addVehicle(matricula, nameCar);
      this.vehicleForm.reset();
    }
  }


  async cerrarModal() {
    await this.modalController.dismiss();
  }

  async openMyVehiclesModal() {
    const modal = await this.modalController.create({
      component: MyVehiclesModalComponent,
    });
    await modal.present();
  }



}