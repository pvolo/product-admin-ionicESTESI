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
  userUid: string;


  ngOnInit() {
    this.userUid = this.user()?.uid;
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
  
    this.firebaseSvc.getAllProducts().subscribe({
      next: async (users: any) => {
        for (let user of users) {
          this.firebaseSvc.getUserProducts(user.uid).subscribe({
            next: async (userProducts: any) => {
              userProducts.forEach((product: Product) => {
                product.userName = user.name;
                product.userUid = user.uid;
              });
              allProducts.push(...userProducts);
  
              await this.utilsSvc.saveInLocalStorage('products', allProducts);
              this.products = allProducts;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error al obtener productos del usuario', user.uid, err);
              this.loading = false;
            }
          });
        }
      },
      error: async (err) => {
        console.error('Error al obtener usuarios', err);
        this.loading = false;
  
        this.products = await this.utilsSvc.getFromLocalStorage('products') || [];
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
  
    if (success) {
      this.getProducts();
    }
  }

//Validar que sea patente Alfanumerica
  isValidPatente(patente: string): boolean {
    const patenteRegex = /^[A-Za-z0-9]{1,7}$/;
    return patenteRegex.test(patente);
  }


  get filteredProducts(): Product[] {
    const seen = new Set();
    
    return this.products.filter(p => {
      // Filtra los productos según las condiciones
      const isValidProduct = p.userUid !== this.user()?.uid &&
                             p.estadoViaje !== 'Finalizado' &&
                             p.estadoViaje !== 'En Camino' &&
                             this.isValidPatente(p.patente) &&
                             p.soldUnits !== 0;
  
      // Si el producto es válido y aún no ha sido visto, se incluye
      if (isValidProduct && !seen.has(p.id)) {  // Suponiendo que `id` es el identificador único del producto
        seen.add(p.id);
        return true;
      }
      return false;
    });
  }
}