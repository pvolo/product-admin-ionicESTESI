import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Geolocation } from '@capacitor/geolocation';
@Component({
  selector: 'app-vehicle-create',
  templateUrl: './vehicle-create.component.html',
})
export class VehicleCreateComponent {
  vehicle = {
    licensePlate: '',
    capacity: 0,
    destination: '',
    destinationCoords: null,
    createdBy: '',
    startCoords: { latitude: 0, longitude: 0 }
  };

  constructor(private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  async saveVehicle() {
    const position = await Geolocation.getCurrentPosition();
    this.vehicle.startCoords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    const user = await this.auth.currentUser;
    if (user) {
      this.vehicle.createdBy = user.uid; 

      await this.firestore.collection('vehicles').add(this.vehicle);
      console.log("Vehículo creado con éxito.");
    } else {
      console.error("No se encontró un usuario autenticado.");
    }
  }
}