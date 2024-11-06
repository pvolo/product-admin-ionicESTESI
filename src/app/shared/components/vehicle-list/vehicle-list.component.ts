import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { OfflineStorageService } from '../../../services/offline-storage.service';
import { Vehicle } from '../../../models/vehicle.model';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  userId: string | null = null; // Variable para almacenar el ID del usuario
  userName: string | null = null; // Variable para almacenar el nombre del usuario

  constructor(
    private offlineStorage: OfflineStorageService,
    private firestore: AngularFirestore,
    private auth: AngularFireAuth // Inyectamos AngularFireAuth directamente
  ) {}

  async ngOnInit() {
    await this.getUserData(); // Obtener ID y nombre del usuario logeado
    await this.loadVehicles(); // Cargar los vehículos disponibles
    this.syncVehicles(); // Sincronizar vehículos desde Firebase
    this.syncReservations(); // Sincronizar reservas desde Firebase
  }

  async getUserData() {
    const user = await this.auth.currentUser;
    if (user) {
      this.userId = user.uid; // Guardamos el ID del usuario
      this.userName = user.displayName; // Guardamos el nombre del usuario
    } else {
      console.error("No se pudo obtener el usuario logeado.");
    }
  }

  async loadVehicles() {
    const vehicles = await this.offlineStorage.getVehicles();
    if (vehicles.length) {
      this.vehicles = vehicles;
    } else if (this.userId) {
      // Filtrar vehículos para excluir los creados por el usuario logeado
      this.firestore.collection<Vehicle>('vehicles', ref => ref.where('createdBy', '!=', this.userId))
        .valueChanges()
        .subscribe((data: Vehicle[]) => {
          this.vehicles = data;
          this.offlineStorage.saveVehicles(data); // Guardamos los vehículos en almacenamiento offline
        });
    }
  }

  async reserveSeat(vehicleId: string) {
    if (this.userId && this.userName) {
      // Agregamos la reserva a Firebase
      await this.firestore.collection<Reservation>('reservations').add({
        vehicleId: vehicleId,
        userId: this.userId,
        userName: this.userName,
        reservationDate: new Date()
      });
      console.log("Reserva realizada con éxito.");
    } else {
      console.error("No se pudo realizar la reserva: usuario no autenticado.");
    }
  }

  syncVehicles() {
    this.firestore.collection<Vehicle>('vehicles').valueChanges().subscribe(async vehicles => {
      await this.offlineStorage.saveVehicles(vehicles); // Guardamos los vehículos en el almacenamiento offline
    });
  }

  syncReservations() {
    this.firestore.collection<Reservation>('reservations').valueChanges().subscribe(async reservations => {
      await this.offlineStorage.saveReservations(reservations); // Guardamos las reservas en el almacenamiento offline
    });
  }
}