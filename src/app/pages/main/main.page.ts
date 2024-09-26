import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  pages = [
    {title:'Inicio', url:'/main/home',icon:'home-outline'},
    {title:'Perfil', url:'/main/profile',icon:'person-outline'},
    {title:'Historial', url:'/main/historial',icon:'time-outline'},


  ]

  router= inject(Router);
  fireBaseSvs = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  currentPath:string='';



  ngOnInit() {
    this.router.events.subscribe((event:any)=>{
      if (event?.url) this.currentPath = event.url
    })
  }




  //==========Datos del Usuario
  user():User{
    return this.utilsSvc.getFromLocalStorage('user');
  }




//==========Cerrar Sesion

signOut(){
  this.fireBaseSvs.signOut();
}



}
