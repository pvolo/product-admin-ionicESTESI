import { Component, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.page.html',
  styleUrls: ['./personal-data.page.scss'],
})
export class PersonalDataPage {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  user: User;
  constructor(private router: Router ) {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    
  }
  async savePersonalData() {
    const rutPattern = /^[0-9]{7,9}$/;
    if (!rutPattern.test(this.user.rut)) {
      this.utilsSvc.presentToast({
        message: 'El RUT debe contener entre 7 y 9 dígitos numéricos.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return;
    }
  
  // Validar Edad

  const birthdate = new Date(this.user.birthdate);
  const currentDate = new Date();
  const age = currentDate.getFullYear() - birthdate.getFullYear();
  const isBirthdayPassedThisYear =
    currentDate.getMonth() > birthdate.getMonth() ||
    (currentDate.getMonth() === birthdate.getMonth() &&
      currentDate.getDate() >= birthdate.getDate());
  if (age < 18 || (age === 18 && !isBirthdayPassedThisYear)) {
    this.utilsSvc.presentToast({
      message: 'Debes ser mayor de 18 años.',
      duration: 2500,
      color: 'danger',
      position: 'middle',
      icon: 'alert-circle-outline'
    });
    return; 
  }
  const formattedBirthdate = `${birthdate.getDate().toString().padStart(2, '0')}/${(birthdate.getMonth() + 1).toString().padStart(2, '0')}/${birthdate.getFullYear()}`;
  this.user.birthdate = formattedBirthdate;
  const loading = await this.utilsSvc.loading();
  await loading.present();
  const path = `users/${this.user.uid}`;
  this.firebaseSvc.updateDocument(path, {
    rut: this.user.rut,
    birthdate: this.user.birthdate
  }).then(() => {
    this.utilsSvc.saveInLocalStorage('user', this.user);
    this.utilsSvc.presentToast({
      message: 'Datos personales actualizados exitosamente',
      duration: 2000,
      color: 'success',
      position: 'middle',
      icon: 'checkmark-circle-outline'
    });
  }).catch(error => {
    console.error(error);
    this.utilsSvc.presentToast({
      message: error.message,
      duration: 2500,
      color: 'danger',
      position: 'middle',
      icon: 'alert-circle-outline'
    });
  }).finally(() => {
    loading.dismiss();
  });
} 
volverAlInicio() {
  this.router.navigate(['./main/home']);
}}