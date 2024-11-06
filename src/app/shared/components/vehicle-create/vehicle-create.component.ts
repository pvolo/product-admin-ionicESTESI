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
    startCoords: { latitude: 0, longitude: 0 } // Añadido startCoords con valores iniciales
  };

  constructor(private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  async saveVehicle() {
    // Obtenemos la ubicación actual del usuario
    const position = await Geolocation.getCurrentPosition();
    this.vehicle.startCoords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    // el ID del usuario logeado
    const user = await this.auth.currentUser;
    if (user) {
      this.vehicle.createdBy = user.uid; 

      // Guardar el vehículo en Firebase
      await this.firestore.collection('vehicles').add(this.vehicle);
      console.log("Vehículo creado con éxito.");
    } else {
      console.error("No se encontró un usuario autenticado.");
    }
  }
}