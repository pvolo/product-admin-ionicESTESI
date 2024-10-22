import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';  // Para obtener el usuario actual

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth  // Inyectamos autenticación para obtener el usuario
  ) {}

  // Guardar las ubicaciones de Salida y Destino en Firestore, asociadas a un usuario
  guardarUbicacion(origen: any, destino: any) {
    // Obtener el usuario actual
    return this.auth.currentUser.then((user) => {
      if (user) {
        // Si hay un usuario logueado, guardamos en Firestore
        return this.firestore.collection('ubicaciones').add({
          uid: user.uid,  // Guardamos la ID del usuario
          origen: origen,
          destino: destino,
          timestamp: new Date(),
        });
      } else {
        throw new Error('No hay un usuario autenticado');
      }
    });
  }
}
