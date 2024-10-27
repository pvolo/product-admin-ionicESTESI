import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

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
    private utilsSvc: UtilsService
  ) {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.form = new FormGroup({
      seats: new FormControl(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.product ? this.product.soldUnits : 1),
      ])
    });
  }

  async reserveSeats() {
    if (this.form.valid) {
      const reservedSeats = this.form.controls['seats'].value;
      if (reservedSeats > this.product.soldUnits) {
        this.utilsSvc.presentToast({
          message: 'Asientos insuficientes',
          color: 'danger'
        });
        return;
      }

      const updatedProduct = {
        ...this.product,
        soldUnits: this.product.soldUnits - reservedSeats
      };

      const path = `users/${this.user.uid}/products/${this.product.id}`;
      await this.firebaseSvc.updateDocument(path, updatedProduct);

      this.utilsSvc.dismissModal({ success: true });
      this.utilsSvc.presentToast({
        message: 'Reserva realizada con éxito',
        color: 'success',
        duration: 2000
      });
    }
  }
}
