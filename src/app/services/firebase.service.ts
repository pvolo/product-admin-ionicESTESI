import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,updateProfile,sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore,setDoc,doc, getDoc,addDoc,collection,collectionData,query,updateDoc,deleteDoc, orderBy } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import{getStorage,uploadString,ref,getDownloadURL,deleteObject} from "firebase/storage"



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

    //====Obtener Documentos de una Coleccion

    getCollectionData(path: string, collectionQuery?: any) {
      const ref = collection(getFirestore(), path);
      const queryRef = query(ref, ...collectionQuery);
      
      collectionData(queryRef, { idField: 'id' }).subscribe(data => {
        console.log('Datos obtenidos de Firebase:', data); // Verifica qué datos se están obteniendo
      });
    
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

    return collectionData(usersQuery, { idField: 'uid' }); // Devuelve los usuarios
  }

  //==== Obtener los productos de un usuario específico
  getUserProducts(uid: string) {
    // Obtenemos los productos de la subcolección de un usuario
    const productsRef = collection(getFirestore(), `users/${uid}/products`);
    const productsQuery = query(productsRef, orderBy('soldUnits', 'desc'));
    
    return collectionData(productsQuery, { idField: 'id' });
  }
}









