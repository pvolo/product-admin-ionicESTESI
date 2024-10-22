import { Component, inject, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { orderBy,where } from 'firebase/firestore';
import { Router } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  fireBaseSvs = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  router = inject(Router); // Inyectar Router

  products:Product[] = [];
  loading:boolean=false;




  ngOnInit() {
  }

  user():User{
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


  //====Obtener las Ganancias
getProfits(){
return this.products.reduce((index,product)=>index + product.price * product.soldUnits, 0)


}







  //====Obtener los Productos
  getProducts(){
    let path = `users/${this.user().uid}/products`;

    this.loading=true;

    let query = [
    orderBy('soldUnits','desc'),
    //Ordenar mayor a... where('soldUnits','>',30)
  ]



    

    let sub = this.fireBaseSvs.getCollectionData(path,query).subscribe({
      next:(res:any) => {
        console.log(res);
        this.products = res;

        this.loading=false;
        sub.unsubscribe();
      }
    })
  }




  //====Agregar o Actualizar Producto
  async addUpdateProduct(product?: Product){

  let success = await  this.utilsSvc.presentModal({
      component:AddUpdateProductComponent,
      cssClass:'add-update-modal',
      componentProps:{ product }
    })

    if(success)this.getProducts();
  }




//====Confirmar Eliminacion del Producto

async confirmDeleteProduct(product:Product) {
  this.utilsSvc.presentAlert({
    header: 'Eliminar!',
    message: '¿Quieres Cancelar El Viaje?',
    mode:'ios',
    buttons: [
      {
        text: 'Cancelar',

      }, {
        text: 'Si, Eliminar',
        handler: () => {
          this.deleteProduct(product)
        }
      }
    ]
  });

}





  //====Eliminar Producto

  async deleteProduct(product:Product) {
    let path = `users/${this.user().uid}/products/${product.id}`
  
    const loading = await this.utilsSvc.loading();
    await loading.present();
  
    let imagePath=await this.fireBaseSvs.getFilePath(product.image);
    await this.fireBaseSvs.deleteFile(imagePath);
  

  
    this.fireBaseSvs.deleteDocument(path).then(async res => {
      
      this.products=this.products.filter(p=>p.id!=product.id)
  
      this.utilsSvc.presentToast({
        message:'Viaje Eliminado Exitosamente',
        duration: 2000,
        color:'success',
        position:'middle',
        icon:'checkmark-circle-outline'
      })
  
    }).catch(error =>{
      console.log(error);
  
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color:'primary',
        position:'middle',
        icon:'alert-circle-outline'
      })
  
    }).finally(()=>{
      loading.dismiss();
    })
  
  }



}
