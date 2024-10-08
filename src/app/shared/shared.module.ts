import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUpdateProductComponent } from './components/add-update-product/add-update-product.component';
import { MapComponent } from './components/map/map.component';



@NgModule({
  declarations: [HeaderComponent,CustomInputComponent,LogoComponent,AddUpdateProductComponent,MapComponent],
  exports:[HeaderComponent,CustomInputComponent,LogoComponent,AddUpdateProductComponent,MapComponent,ReactiveFormsModule],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
