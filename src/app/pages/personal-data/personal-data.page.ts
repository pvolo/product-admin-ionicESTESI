import { Component, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.page.html',
  styleUrls: ['./personal-data.page.scss'],
})
export class PersonalDataPage {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  user: User;

  constructor() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
  }

  async savePersonalData() {
    // Validar el RUT
    const rutPattern = /^[0-9]{7,9}$/;
    if (!rutPattern.test(this.user.rut)) {
      this.utilsSvc.presentToast({
        message: 'El RUT debe contener entre 7 y 9 dígitos numéricos.',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return; // No continuar si el RUT es inválido
    }
  
    // Quitar la hora de la fecha de nacimiento si está presente
    if (this.user.birthdate) {
      const [year, month, day] = this.user.birthdate.split('T')[0].split('-');
      this.user.birthdate = `${day}/${month}/${year}`;
    }
  
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
}
  