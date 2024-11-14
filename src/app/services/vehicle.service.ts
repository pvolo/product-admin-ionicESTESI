import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Vehicle } from '../models/vehicle.model';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private vehiclesCollection = this.firestore.collection<Vehicle>('vehicles');

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  async addVehicle(matricula: string, nameCar: string): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      const newVehicle: Vehicle = {
        matricula,
        nameCar,
        userId: (await user).uid,
        createdAt: new Date(),
      };
      await this.vehiclesCollection.add(newVehicle);
    }
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.vehiclesCollection.valueChanges({ idField: 'id' });
  }

  getVehiclesByUserId(userId: string): Observable<Vehicle[]> {
    return this.firestore
      .collection<Vehicle>('vehicles', (ref) =>
        ref.where('userId', '==', userId)
      )
      .valueChanges({ idField: 'id' });
  }
}
