import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Vehicle } from '../models/vehicle.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, take } from 'rxjs/operators';
import { Observable, from, of, switchMap } from 'rxjs';

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
    const user = await this.auth.currentUser;
    if (user) {
      const newVehicle: Vehicle = {
        matricula,
        nameCar,
        userId: user.uid,
        createdAt: new Date(),
      };

      // Verificar si la matrícula ya existe
      const isUnique = await this.isMatriculaUnique(matricula);
      if (isUnique) {
        await this.vehiclesCollection.add(newVehicle);
      } else {
        throw new Error('La patente ya está registrada por otro usuario.');
      }
    }
  }

  getVehiclesByUserId(): Observable<Vehicle[]> {
    return from(this.auth.currentUser).pipe(
      switchMap((user) => {
        if (user) {
          return this.firestore
            .collection<Vehicle>('vehicles', (ref) =>
              ref.where('userId', '==', user.uid)
            )
            .valueChanges({ idField: 'id' });
        } else {
          // Si no hay un usuario autenticado, devuelve un array vacío
          return of([]);
        }
      })
    );}

    async updateVehicle(vehicleId: string, updatedData: Partial<Vehicle>): Promise<void> {
      try {
        await this.firestore.collection('vehicles').doc(vehicleId).update(updatedData);
      } catch (error) {
        console.error('Error al actualizar el vehículo:', error);
      }
    }

  async isMatriculaUnique(matricula: string): Promise<boolean> {
    const result = await this.firestore
      .collection<Vehicle>('vehicles', (ref) => ref.where('matricula', '==', matricula))
      .get()
      .toPromise();

    return result.empty;
  }


  async deleteVehicle(vehicleId: string): Promise<void> {
    await this.firestore.collection('vehicles').doc(vehicleId).delete();
  }



  getAllVehicles(): Observable<Vehicle[]> {
    return this.firestore
      .collection<Vehicle>('vehicles')
      .valueChanges({ idField: 'id' });
  }

  getVehiclesByUser(userId: string): Observable<Vehicle[]> {
    return this.firestore
      .collection<Vehicle>('vehicles', ref => ref.where('userId', '==', userId))
      .valueChanges({ idField: 'id' });
  }




  
}