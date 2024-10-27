import { Component, inject, OnInit } from '@angular/core';
import { orderBy } from 'firebase/firestore';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
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

  ngOnInit() {}

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

  getProducts() {
    let path = `users/${this.user().uid}/products`;
    this.loading = true;
    let query = [orderBy('soldUnits', 'desc')];

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        this.products = res;
        this.loading = false;
        sub.unsubscribe();
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
