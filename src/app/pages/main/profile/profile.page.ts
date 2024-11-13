import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  router = inject(Router);
  editableName: string;
  showAddPersonalData: boolean = true;
  isNameChanged: boolean = false;
  ngOnInit() {
    const user = this.user();
    if (user) {
      this.editableName = user.name;
      this.showAddPersonalData = !(user.rut && user.birthdate);
    }
  }
  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }
  goToPersonalData() {
    this.router.navigate(['../personal-data']);
  }
  onNameChange() {
    const originalName = this.user().name;
this.isNameChanged = this.editableName.trim() !== originalName.trim() &&
this.editableName.length > 0 && 
this.editableName.length <= 15 &&
!/\s/.test(this.editableName);
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
      return; 
    }
// Validar que el nombre solo contenga letras y no espacios
if (!/^[a-zA-Z]{1,15}$/.test(this.editableName)) {
  this.utilsSvc.presentToast({
    message: 'El nombre debe contener solo letras y un máximo de 15 caracteres sin espacios.',
    duration: 2500,
    color: 'danger',
    position: 'middle',
    icon: 'alert-circle-outline'
  });
  return; 
}
let user = this.user();
let path = `users/${user.uid}`;
user.name = this.editableName;
const loading = await this.utilsSvc.loading();
await loading.present();
this.firebaseSvc.updateDocument(path, { name: user.name }).then(async res => {
  this.utilsSvc.saveInLocalStorage('user', user);
  this.isNameChanged = false; 
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
