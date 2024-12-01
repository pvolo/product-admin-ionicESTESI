import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,updateProfile,sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore,setDoc,doc, getDoc,getDocs,addDoc,collection,collectionData,query,updateDoc,deleteDoc, orderBy,where } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import{getStorage,uploadString,ref,getDownloadURL,deleteObject} from "firebase/storage"
import { from, Observable } from 'rxjs';
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
    
    // Primero obtenemos todos los usuarios
    const usersRef = collection(getFirestore(), 'users'); // Reemplaza 'users' por tu ruta correcta si es diferente
    const usersQuery = query(usersRef);

    return collectionData(usersQuery, { idField: 'uid' });
     // Devuelve los usuarios
  }




// Método para actualizar los asientos vendidos (soldUnits) de un producto
updateProductSoldUnits(uid: string, productId: string, reservedSeats: number) {
  const productRef = doc(getFirestore(), `users/${uid}/products/${productId}`);

  return getDoc(productRef).then(docSnapshot => {
    if (docSnapshot.exists()) {
      const productData = docSnapshot.data();

      const currentSoldUnits = productData && typeof productData["soldUnits"] === 'number' 
        ? productData["soldUnits"] 
        : 0;

      const newSoldUnits = currentSoldUnits - reservedSeats;

      return updateDoc(productRef, {
        soldUnits: newSoldUnits
      });
    } else {
      console.error('El producto no existe');
      return Promise.reject('El producto no existe');
    }
  }).catch(error => {
    console.error('Error actualizando soldUnits:', error);
    return Promise.reject(error);
  });
}






  // Método para obtener las ubicaciones del usuario
  getUbicacionesDeUsuario(userId: string): Observable<any[]> {
    return this.firestore.collection(`users/${userId}/ubicaciones`).valueChanges(); // Correcto, solo recuperamos los datos
  }

 // Método para obtener el UID del usuario logueado
 getCurrentUserUid(): Observable<string | null> {
  return this.auth.authState.pipe(
    // 'authState' emite el usuario cuando cambia
    map(user => user ? user.uid : null)
  );
}

// Método para obtener las reservaciones de un usuario por su UID
getUserReservations(uid: string): Observable<any[]> {
  const reservationsRef = collection(getFirestore(), 'reservados');
  
  const q = query(reservationsRef, where('userUid', '==', uid));

  return from(getDocs(q).then(querySnapshot => {
    const reservas = querySnapshot.docs.map(doc => doc.data());
    return reservas; 
  }));
}






getRutasDeUsuario(userUid: string): Observable<any[]> {
  const rutasRef = collection(getFirestore(), `users/${userUid}/ubicaciones`);
  return collectionData(rutasRef, { idField: 'id' }) as Observable<any[]>;
}




//PETICIONES

// Método para agregar una solicitud de reserva
addReservationRequest(uid: string, productId: string, request: any) {
  const requestRef = collection(getFirestore(), `users/${uid}/products/${productId}/solicitudes`);
  return addDoc(requestRef, request);
}

// Método para obtener las solicitudes pendientes de reserva
getReservationRequests(uid: string, productId: string) {
  const requestsRef = collection(getFirestore(), `users/${uid}/products/${productId}/solicitudes`);
  return collectionData(requestsRef, { idField: 'id' });
}





//PROBANDO



async addToReservados(userUid: string, productId: string, request: any) {
  // Referencia a la colección "reservados"
  const reservadosRef = collection(getFirestore(), 'reservados'); 
  
  await addDoc(reservadosRef, {
    userUid: request.userUid,        
    userName: request.userName,    
    userEmail: request.userEmail,    
    reservedSeats: request.reservedSeats,  
    reservationDate: request.reservationDate, 
    acceptedBy: userUid,            
    productId: productId,            
    productCreatorUid: request.productCreatorUid, 
    productCreatorName: request.productCreatorName, 
    productCreatorNameRuta: request.productCreatorNameRuta,
    status: 'confirmed',
    patente: request.patente || null // Añadir el campo patente             
  });
}

// Eliminar una solicitud de reserva
deleteReservationRequest(productCreatorUid: string, productId: string, requestId: string) {
  const requestPath = `users/${productCreatorUid}/products/${productId}/solicitudes/${requestId}`;
  return this.deleteDocument(requestPath);  
}

//Eliminar una solicitud rechazada
async rejectRequest(requestId: string) {
  const requestRef = this.firestore.collection('users').doc(requestId)
    .collection('products').doc(requestId).collection('solicitudes').doc(requestId);
  await requestRef.delete();
}


deleteDocumentt(requestId){
  return deleteDoc(doc(getFirestore('solicitudes'),requestId));
}  


async deleteRequest(uid: string, productId: string, requestId: string) {
  const requestRef = this.firestore.collection('users').doc(uid).collection('products').doc(productId).collection('solicitudes').doc(requestId);
  console.log('Eliminando solicitud en:', requestRef.ref.path); 
  await requestRef.delete();
  console.log('Solicitud con ID', requestId, 'eliminada correctamente');
}



//PARA EL CONDUCTOR
getReservationsForConductor(conductorUid: string): Observable<any[]> {
  const reservationsRef = collection(getFirestore(), 'reservados');
  const q = query(reservationsRef, where('productCreatorUid', '==', conductorUid));

  return from(
    getDocs(q).then(querySnapshot => {
      const reservas = querySnapshot.docs.map(doc => doc.data());
      return reservas;
    })
  );
}

  // ====== Obtener los productos de un usuario específico y almacenarlos en el LocalStorage
  getUserProducts(uid: string): Observable<any[]> {
    const productsRef = collection(getFirestore(), `users/${uid}/products`);
    const productsQuery = query(productsRef, orderBy('soldUnits', 'desc'));

    const products$ = collectionData(productsQuery, { idField: 'id' });

    products$.subscribe(products => {
      this.saveProductsInLocalStorage(uid, products);
    });

    return products$;
  }

  // Guardar productos en LocalStorage
  saveProductsInLocalStorage(uid: string, products: any[]): void {
    localStorage.setItem(`products_${uid}`, JSON.stringify(products));
  }

  // Obtener productos desde LocalStorage
  getProductsFromLocalStorage(uid: string): any[] {
    const products = localStorage.getItem(`products_${uid}`);
    return products ? JSON.parse(products) : [];
  }








}








