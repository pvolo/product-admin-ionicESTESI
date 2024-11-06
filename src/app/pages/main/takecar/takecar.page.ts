import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { ReserveComponent } from 'src/app/shared/components/reserve/reserve.component';

@Component({
  selector: 'app-takecar',
  templateUrl: './takecar.page.html',
  styleUrls: ['./takecar.page.scss'],
})
export class TakecarPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  products: Product[] = [];
  loading = false;

  ngOnInit() {
    this.getProducts();
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getProducts();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  async getProducts() {
    this.loading = true;
    const allProducts: Product[] = [];

    // 1. Obtener todos los usuarios
    this.firebaseSvc.getAllProducts().subscribe({
      next: async (users: any) => {
        // 2. Para cada usuario, obtener sus productos
        for (let user of users) {
          // Obtiene los productos de este usuario
          this.firebaseSvc.getUserProducts(user.uid).subscribe({
            next: (userProducts: any) => {
              // Agregar el nombre del usuario a cada producto
              userProducts.forEach((product: Product) => {
                product.userName = user.name; // Agrega el nombre del usuario al producto
              });

              allProducts.push(...userProducts); // Agregar productos al arreglo
              this.products = allProducts; // Asignar todos los productos a this.products
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  async addUpdateProduct(product?: Product) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    });
    if (success) this.getProducts();
  }

  async reserveProduct(product: Product) {
    let success = await this.utilsSvc.presentModal({
      component: ReserveComponent,
      componentProps: { product }
    });
    if (success) this.getProducts();
  }
}