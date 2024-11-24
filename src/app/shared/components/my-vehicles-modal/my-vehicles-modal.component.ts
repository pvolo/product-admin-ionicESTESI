import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleComponent } from '../vehicle/vehicle.component'; 

@Component({
  selector: 'app-my-vehicles-modal',
  templateUrl: './my-vehicles-modal.component.html',
})
export class MyVehiclesModalComponent implements OnInit {
  vehicles: Vehicle[] = [];
  editForm: FormGroup; 
  selectedVehicle: Vehicle | null = null;

  constructor(
    private vehicleService: VehicleService,
    private modalController: ModalController,private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      matricula: ['', [Validators.required]],
      nameCar: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.vehicleService.getVehiclesByUserId().subscribe((data) => {
      this.vehicles = data;
    });
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  editVehicle(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
    this.editForm.patchValue({
      matricula: vehicle.matricula,
      nameCar: vehicle.nameCar
    });

    this.openEditVehicleModal();
  }

  async openEditVehicleModal() {
    const modal = await this.modalController.create({
      component: VehicleComponent,
      componentProps: {
        vehicle: this.selectedVehicle 
      }
    });

    await modal.present();

    modal.onDidDismiss().then(() => {
      this.loadVehicles();
    });
  }

  async deleteVehicle(vehicleId: string) {
    await this.vehicleService.deleteVehicle(vehicleId);
    this.loadVehicles(); 
  }


  
}
