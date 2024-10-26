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

  // Save origin, destination, and route name in Firestore, associated with a user
  guardarUbicacion(origen: { lat: number, lng: number }, destino: { lat: number, lng: number }, nombreRuta: string) {
    // Get the current user
    return this.auth.currentUser.then((user) => {
      if (user) {
        // If user is logged in, save to Firestore
        const routeData = {
          uid: user.uid,
          origen,
          destino,
          nombreRuta,
          timestamp: new Date(),
        };

        // Save the route data in the user's 'ubicaciones' collection
        return this.firestore.collection(`users/${user.uid}/ubicaciones`).add(routeData);
      } else {
        throw new Error('No hay un usuario autenticado');
      }
    });
  }
}
