import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  guardarUbicacion(origen: { lat: number, lng: number }, destino: { lat: number, lng: number }, nombreRuta: string) {
    // Get the current user
    return this.auth.currentUser.then((user) => {
      if (user) {
        const routeData = {
          uid: user.uid,
          origen,
          destino,
          nombreRuta,
          timestamp: new Date(),
        };

        return this.firestore.collection(`users/${user.uid}/ubicaciones`).add(routeData);
      } else {
        throw new Error('No hay un usuario autenticado');
      }
    });
  }
}
