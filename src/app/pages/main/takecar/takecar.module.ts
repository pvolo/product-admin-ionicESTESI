import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TakecarPageRoutingModule } from './takecar-routing.module';

import { TakecarPage } from './takecar.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TakecarPageRoutingModule,
    SharedModule
  ],
  declarations: [TakecarPage]
})
export class TakecarPageModule {}
