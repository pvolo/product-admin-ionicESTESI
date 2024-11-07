import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.scss']
})
export class ReserveComponent {
  @Input() product: Product;
  user: User;
  form: FormGroup;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) 
  
  
  {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.form = new FormGroup({
      seats: new FormControl(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.product ? this.product.soldUnits : 8),
      ])
    });
  }

  async reserveSeats() {
    if (this.form.valid) {
      const reservedSeats = this.form.controls['seats'].value;
  
      // Verificar si la cantidad de asientos reservados no excede los asientos disponibles
      if (reservedSeats > this.product.soldUnits) {
        this.utilsSvc.presentToast({
          message: 'Asientos insuficientes',
          color: 'danger',
          duration: 2000
        });
        return;
      }
  
      // Datos de la reserva
      const reservation = {
        userUid: this.user.uid,
        userName: this.user.name,
        userEmail: this.user.email,
        reservedSeats,
        productId: this.product.id,
        productName: this.product.name
      };
  
      // Guardar la reserva en Firebase
      const reservationPath = `users/${this.user.uid}/reservations`;
      await this.firebaseSvc.addDocument(reservationPath, reservation);
  
      // Actualizar el número de asientos disponibles en el producto en Firebase
      const updatedSoldUnits = this.product.soldUnits - reservedSeats;
  
      if (updatedSoldUnits >= 0) {
        // Verifica que esté actualizando el producto en la subcolección de ese usuario específico
        await this.firebaseSvc.updateProductSoldUnits(this.product.userUid, this.product.id, updatedSoldUnits);
      }
  
      // Cerrar el modal y mostrar mensaje de éxito
      this.utilsSvc.dismissModal({ success: true });
      this.utilsSvc.presentToast({
        message: 'Reserva realizada con éxito',
        color: 'success',
        duration: 2000
      });
    }
  }

  async cerrarModal() {
    await this.modalController.dismiss();
  }

}

