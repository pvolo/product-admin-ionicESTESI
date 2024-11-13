// En reserve.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ModalController } from '@ionic/angular';
import * as mapboxgl from 'mapbox-gl';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.component.html',
  styleUrls: ['./reserve.component.scss']
})
export class ReserveComponent implements OnInit {
  @Input() product: Product;
  user: User;
  form: FormGroup;
  map: mapboxgl.Map;
  routeData$: Observable<any>;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.form = new FormGroup({
      seats: new FormControl(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.product ? this.product.soldUnits : 8)
      ])
    });
  }

  ngOnInit() {
    if (this.product && this.product.nombreRuta) {
      this.routeData$ = this.firebaseSvc.getUbicacionPorNombreRuta(this.product.nombreRuta);
      this.routeData$.subscribe(route => {
        if (route) {
          this.initializeMap(route.origen, route.destino);
        }
      });
    }
  }

  initializeMap(origen: { lat: number, lng: number }, destino: { lat: number, lng: number }) {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origen.lng, origen.lat], 
      zoom: 13
    });
  
   
    this.map.scrollZoom.enable();
    this.map.boxZoom.disable();
    this.map.dragRotate.disable();
    this.map.dragPan.enable();
    this.map.keyboard.disable();
    this.map.doubleClickZoom.disable();
    this.map.touchZoomRotate.enable();
  
    // Marcadores de origen y destino
    new mapboxgl.Marker({ color: 'green' })
      .setLngLat([origen.lng, origen.lat])
      .setPopup(new mapboxgl.Popup().setText('Origen'))
      .addTo(this.map);
  
    new mapboxgl.Marker({ color: 'red' })
      .setLngLat([destino.lng, destino.lat])
      .setPopup(new mapboxgl.Popup().setText('Destino'))
      .addTo(this.map);
  
    const directionsRequest = `https://api.mapbox.com/directions/v5/mapbox/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?geometries=geojson&access_token=${(mapboxgl as any).accessToken}`;
  
    fetch(directionsRequest)
      .then(response => response.json())
      .then(data => {
        const route = data.routes[0].geometry;
        
        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route,
            properties: {} 
          }
        });
        
  
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ff8800',
            'line-width': 4
          }
        });
      })
      .catch(error => console.error('Error fetching directions:', error));
  }
;
  

async reserveSeats() {
  if (this.form.valid) {
    const reservedSeats = this.form.controls['seats'].value;

    if (reservedSeats > this.product.soldUnits) {
      this.utilsSvc.presentToast({
        message: 'Asientos insuficientes',
        color: 'danger',
        duration: 2000
      });
      return;
    }

    const reservation = {
      userUid: this.user.uid,
      userName: this.user.name,
      userEmail: this.user.email,
      reservedSeats: reservedSeats,
      productId: this.product.id,
      productName: this.product.nombreRuta,
      reservationDate: new Date().toISOString(), 
      productCreatorUid: this.product.userUid, 
      productCreatorName: this.product.userName,
      productState :this.product.estadoViaje
    };

    // Guardar la reserva en Firebase
    const reservationPath = `users/${this.user.uid}/reservations`;
    await this.firebaseSvc.addDocument(reservationPath, reservation);

    // Actualizar las  disp. del vehiculo
    const updatedSoldUnits = this.product.soldUnits - reservedSeats;
    if (updatedSoldUnits >= 0) {
      await this.firebaseSvc.updateProductSoldUnits(this.product.userUid, this.product.id, updatedSoldUnits);
    }

    this.utilsSvc.dismissModal({ success: true });
    this.utilsSvc.presentToast({
      message: 'Reserva realizada con éxito',
      color: 'success',
      duration: 2000
    });
  }
}


  async cerrarModal() {
    await this.modalController.dismiss();
  }
}
