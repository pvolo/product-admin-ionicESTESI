import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,updateProfile,sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore,setDoc,doc, getDoc,addDoc,collection,collectionData,query,updateDoc,deleteDoc, orderBy } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import{getStorage,uploadString,ref,getDownloadURL,deleteObject} from "firebase/storage"
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage= inject(AngularFireStorage)
  utilsSvc= inject(UtilsService)

  //=================AUTENTICACION
  getAuth(){
    return getAuth();

  }



    //======ACCEDER
    signIn(user:User){
      return signInWithEmailAndPassword(getAuth(), user.email,user.password );
    }

    //======Crear User
    signUp(user:User){
      return createUserWithEmailAndPassword(getAuth(), user.email,user.password );
    }


    //======Actualizar User
    updateUser(displayName: string){
      return updateProfile(getAuth().currentUser,{displayName})
    }    


    //======Enviar email para restablecer Contraseña
    sendRecoveryEmail(email: string){
  return sendPasswordResetEmail(getAuth(),email)
    }


    //======Cerrar Sesion
    signOut(){
      getAuth().signOut();
      localStorage.removeItem('user');
      this.utilsSvc.routerLink('/auth')
    }



    //========= BASE DE DATOS ============

  // Obtener la ubicación por nombreRuta del usuario
  getUbicacionPorNombreRuta(nombreRuta: string): Observable<any> {
    // Realizar una consulta en todas las subcolecciones 'ubicaciones' de los usuarios
    return this.firestore
      .collectionGroup('ubicaciones', ref => ref.where('nombreRuta', '==', nombreRuta))  // Consulta a nivel global por nombreRuta
      .valueChanges()
      .pipe(
        map(ubicaciones => ubicaciones.length > 0 ? ubicaciones[0] : null)  // Asume que hay solo una ubicación por nombreRuta
      );
  }


    //====Obtener Documentos de una Coleccion

    getCollectionData(path: string, collectionQuery?: any) {
      const ref = collection(getFirestore(), path);
      const queryRef = collectionQuery ? query(ref, ...collectionQuery) : ref;  // Aplica la query si se pasa
    
      return collectionData(queryRef, { idField: 'id' });
    }



    //====Setear Un Documento
    setDocument(path: string, data:any){
      return setDoc(doc(getFirestore(),path),data);
    }

    //====Actualizar Un Documento
    updateDocument(path: string, data:any){
      return updateDoc(doc(getFirestore(),path),data);
    }    


    //====Eliminar  Un Documento
    deleteDocument(path: string){
      return deleteDoc(doc(getFirestore(),path));
    }  



    //====Obtener Un Documento
    async getDocument(path: string){
      return (await getDoc(doc(getFirestore(),path))).data();
      }  



    //====Agregar Un Documento
      addDocument(path: string, data:any){
        return addDoc(collection(getFirestore(),path),data);
      }


    //=======================================Almacenamiento
    //====Subir Imagen
    async uploadImage(path: string, data_url:string){
      return uploadString(ref(getStorage(),path),data_url,'data_url').then(()=>{
        return getDownloadURL(ref(getStorage(),path))
      })
    }
    

    //====Obtener ruta de la imagen con su Urls
   async getFilePath(url: string){
    return ref(getStorage(),url).fullPath
  }



    //====Eliminar Archivo

    deleteFile(path:string){
      return deleteObject(ref(getStorage(),path))
    }

  //==== Obtener los productos de todos los usuarios
  getAllProducts() {
    
    const usersRef = collection(getFirestore(), 'users'); 
    const usersQuery = query(usersRef);

    return collectionData(usersQuery, { idField: 'uid' });
  }

  getUserProducts(uid: string) {
    const productsRef = collection(getFirestore(), `users/${uid}/products`);
    const productsQuery = query(productsRef, orderBy('soldUnits', 'desc'));
    
    return collectionData(productsQuery, { idField: 'id' });
  }


// Actualizar los asientos vendidos de un producto
updateProductSoldUnits(uid: string, productId: string, soldUnits: number) {
  const productRef = doc(getFirestore(), `users/${uid}/products/${productId}`);
  return updateDoc(productRef, { soldUnits });
}

  // Obtener las ubicaciones del usuario
  getUbicacionesDeUsuario(userId: string): Observable<any[]> {
    return this.firestore.collection(`users/${userId}/ubicaciones`).valueChanges(); // Correcto, solo recuperamos los datos
  }

 // Obtener el UID del usuario logueado
 getCurrentUserUid(): Observable<string | null> {
  return this.auth.authState.pipe(
    map(user => user ? user.uid : null)
  );
}

// Obtener las reservaciones de un usuario por su UID
getUserReservations(uid: string): Observable<any[]> {
  const reservationsRef = this.firestore.collection(`users/${uid}/reservations`);
  return reservationsRef.valueChanges();
}

//Obtener rutas del user 
getRutasDeUsuario(userUid: string): Observable<any[]> {
  const rutasRef = collection(getFirestore(), `users/${userUid}/ubicaciones`);
  return collectionData(rutasRef, { idField: 'id' }) as Observable<any[]>;
}



}









