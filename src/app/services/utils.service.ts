import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private _storage: Storage | null = null;


  loadingCtrl= inject(LoadingController);
  toastCtrl= inject(ToastController);
  modarCtrl= inject(ModalController);
  router= inject(Router)
  alertCtrl=inject(AlertController)




  //====almacenamiento local prod
  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // Inicializa el almacenamiento
    const storage = await this.storage.create();
    this._storage = storage;
  }





  async takePicture(promptLabelHeader: string){
  return await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,
    promptLabelHeader,
    promptLabelPhoto:'Selecciona una Imagen',
    promptLabelPicture:'Toma una Foto'
  });

};



  //====Alert

async presentAlert(opts?: AlertOptions) {
  const alert = await this.alertCtrl.create(opts);

  await alert.present();
}


  //====LOADING 
  loading(){
    return this.loadingCtrl.create({spinner:'crescent'})
  }




    //====TOAST 
  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }



    //====Enruta a cualquier Pagina Disponible 
    routerLink(url: string){
  return this.router.navigateByUrl(url);   
    }



    //====Guardar elemento en Localstorage
    saveInLocalStorage(key: string, value:any){   

      return localStorage.setItem(key, JSON.stringify(value))
        }


    //====Obtener elemento de Localstorage
    getFromLocalStorage(key: string){   
      return JSON.parse(localStorage.getItem(key))
        }        

    //====Modal
    async presentModal(opts: ModalOptions) {
      const modal = await this.modarCtrl.create(opts);
      await modal.present();

      const {data} = await modal.onWillDismiss();
      if (data) return (data);
    }

    dismissModal(data?: any){
      return this.modarCtrl.dismiss(data)
    }






}
