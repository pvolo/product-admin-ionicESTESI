import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';
import { Vehicle } from '../models/vehicle.model';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private _storage: Storage | null = null;

  constructor(
    private storage: Storage,
    private firestore: AngularFirestore // Conexión a Firebase
  ) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  // Método para guardar vehículos en almacenamiento offline
  async saveVehicles(vehicles: Vehicle[]) {
    await this._storage?.set('vehicles', vehicles);
  }

  // Método para guardar reservas en almacenamiento offline
  async saveReservations(reservations: Reservation[]) {
    await this._storage?.set('reservations', reservations);
  }

  // Sincroniza los vehículos desde Firebase al almacenamiento offline
  async syncVehicles() {
    this.firestore.collection<Vehicle>('vehicles').valueChanges().subscribe(async vehicles => {
      await this.saveVehicles(vehicles); // Usar el método para guardar vehículos
    });
  }

  // Sincroniza las reservas desde Firebase al almacenamiento offline
  async syncReservations() {
    this.firestore.collection<Reservation>('reservations').valueChanges().subscribe(async reservations => {
      await this.saveReservations(reservations); // Usar el método para guardar reservas
    });
  }

  // Métodos para recuperar datos del almacenamiento local
  async getVehicles() {
    return (await this._storage?.get('vehicles')) || [];
  }

  async getReservations() {
    return (await this._storage?.get('reservations')) || [];
  }
}
