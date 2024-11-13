import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-update-product',
  templateUrl: './add-update-product.component.html',
  styleUrls: ['./add-update-product.component.scss'],
})
export class AddUpdateProductComponent implements OnInit {
  @Input() product: Product;
  constructor(
    private modalController: ModalController
  ){}

  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    patente: new FormControl('', [Validators.required, Validators.minLength(7),
      Validators.maxLength(7),
      Validators.pattern('^[A-Za-z0-9]{7}$')  ]),
    price: new FormControl(null, [Validators.required, Validators.min(1)]),
    soldUnits: new FormControl(null, [Validators.required, Validators.min(1)]),
    departureTime: new FormControl('', [Validators.required]),
    nombreRuta: new FormControl('', [Validators.required]),
    estadoViaje: new FormControl('', [Validators.required]) 
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router);

  user = {} as User;
  ubicaciones$!: Observable<any[]>;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    
    if (this.product) {
      this.form.setValue({
        id: this.product.id,
        image: this.product.image,
        patente: this.product.patente,
        price: this.product.price,
        soldUnits: this.product.soldUnits,
        departureTime: this.product.departureTime,
        nombreRuta: this.product.nombreRuta,
        estadoViaje: this.product.estadoViaje || ''
      });
    }
    
    this.loadUbicaciones();
  }

  loadUbicaciones() {
    this.ubicaciones$ = this.firebaseSvc.getUbicacionesDeUsuario(this.user.uid);
  }

  //===========TOMAR/SELECCIONAR UNA FOTO

  async takeImage() {
    const dataUrl = (await this.utilsSvc.takePicture('Imagen del Viaje')).dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  submit() {
    if (this.form.valid) {
      if (this.product) this.updateProduct();
      else this.createProduct();
    }
  }

  //================ Convertir valores de tipo str a numb

  setNumberInputs() {
    let { soldUnits, price } = this.form.controls;
    if (soldUnits.value) soldUnits.setValue(parseFloat(soldUnits.value));
    if (price.value) price.setValue(parseFloat(price.value));
  }

  //================ CREAR PRODUCTO

  async createProduct() {
    let path = `users/${this.user.uid}/products`;
    const loading = await this.utilsSvc.loading();
    await loading.present();

    //========= SUBIR IMAGEN Y OBTENER URL ============

    let dataUrl = this.form.value.image;
    let imagePath = `${this.user.uid}/${Date.now()}`;
    let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
    this.form.controls.image.setValue(imageUrl);
    const newProduct = {
      ...this.form.value,
      userUid: this.user.uid
    };
    delete newProduct.id;
    this.firebaseSvc.addDocument(path, newProduct).then(async res => {
      this.utilsSvc.dismissModal({ success: true });
      this.utilsSvc.presentToast({
        message: 'Viaje Añadido Exitosamente',
        duration: 2000,
        color: 'warning',
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

  //================ ACTUALIZAR PRODUCTO

  async updateProduct() {
    let path = `users/${this.user.uid}/products/${this.product.id}`;
    const loading = await this.utilsSvc.loading();
    await loading.present();
    if (this.form.value.image !== this.product.image) {
      let dataUrl = this.form.value.image;
      let imagePath = await this.firebaseSvc.getFilePath(this.product.image);
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);
    }
    const updatedProduct = {
      ...this.form.value,
      userUid: this.user.uid
    };
    delete updatedProduct.id;
    this.firebaseSvc.updateDocument(path, updatedProduct).then(async res => {
      this.utilsSvc.dismissModal({ success: true });
      this.utilsSvc.presentToast({
        message: 'Viaje Actualizado Exitosamente',
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
  irAMap() {
    this.router.navigate(['/map']);
  }

  async cerrarModal() {
    await this.modalController.dismiss();
  }
}