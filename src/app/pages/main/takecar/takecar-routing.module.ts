import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TakecarPage } from './takecar.page';

const routes: Routes = [
  {
    path: '',
    component: TakecarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TakecarPageRoutingModule {}
