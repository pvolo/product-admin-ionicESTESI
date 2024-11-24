import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUpdateProductComponent } from './components/add-update-product/add-update-product.component';
import { ReserveComponent } from './components/reserve/reserve.component';
import { VehicleComponent } from './components/vehicle/vehicle.component';
import { MyVehiclesModalComponent } from './components/my-vehicles-modal/my-vehicles-modal.component';
import { RequestsComponent } from './components/requests/requests.component';



@NgModule({
  declarations: [HeaderComponent,CustomInputComponent,LogoComponent,AddUpdateProductComponent,ReserveComponent,VehicleComponent,MyVehiclesModalComponent,RequestsComponent],
  exports:[HeaderComponent,CustomInputComponent,LogoComponent,AddUpdateProductComponent,ReactiveFormsModule,ReserveComponent,MyVehiclesModalComponent,RequestsComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
