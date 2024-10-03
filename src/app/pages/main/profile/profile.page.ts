import { Component, Inject, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  editableName: string;

  ngOnInit() {
    this.editableName = this.user().name; // Inicializar el nombre editable
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  //===========TOMAR/SELECCIONAR UNA FOTO
  async takeImage() {
    let user = this.user();
    let path = `users/${user.uid}`;

    const dataUrl = (await this.utilsSvc.takePicture('Imagen del Perfil')).dataUrl;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = `${user.uid}/profile`;
    user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

    this.firebaseSvc.updateDocument(path, { image: user.image }).then(async res => {
      this.utilsSvc.saveInLocalStorage('user', user);

      this.utilsSvc.presentToast({
        message: 'Imagen Actualizada Exitosamente',
        duration: 2000,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.log(error);

      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }).finally(() => {
      loading.dismiss();
    });
  }

  //===========GUARDAR EL NOMBRE EDITADO
  async saveName() {
    if (!this.editableName.trim()) {
      this.utilsSvc.presentToast({
        message: 'El nombre no puede estar vacío.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return; // No continuar con la actualización
    }
  
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(this.editableName)) {
      this.utilsSvc.presentToast({
        message: 'El nombre solo puede contener letras y espacios.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return; // No continuar con la actualización
    }
  
    let user = this.user();
    let path = `users/${user.uid}`;
  
    // Verificar si han pasado 30 días desde el último cambio
    const now = new Date();
    const lastChangeDate = user.lastNameChange ? new Date(user.lastNameChange) : null;
    const diffTime = now.getTime() - (lastChangeDate ? lastChangeDate.getTime() : 0);
    const diffDays = diffTime / (1000 * 3600 * 24);
  
    if (lastChangeDate && diffDays < 30) {
      const daysLeft = Math.ceil(30 - diffDays);
      this.utilsSvc.presentToast({
        message: `Debes esperar ${daysLeft} días para cambiar tu nombre nuevamente.`,
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return; // No continuar con la actualización
    }
  
    user.name = this.editableName;
    user.lastNameChange = now; // Actualizar la fecha de cambio
  
    const loading = await this.utilsSvc.loading();
    await loading.present();
  
    this.firebaseSvc.updateDocument(path, { name: user.name, lastNameChange: user.lastNameChange }).then(async res => {
      this.utilsSvc.saveInLocalStorage('user', user);
  
      this.utilsSvc.presentToast({
        message: 'Nombre Actualizado Exitosamente',
        duration: 2000,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.log(error);
  
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }).finally(() => {
      loading.dismiss();
    });
  }
}
