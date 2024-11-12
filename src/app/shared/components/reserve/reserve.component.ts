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
      // Cargar los datos de la ubicación asociados a la ruta sin filtrar por UID
      this.routeData$ = this.firebaseSvc.getUbicacionPorNombreRuta(this.product.nombreRuta);
      this.routeData$.subscribe(route => {
        if (route) {
          this.initializeMap(route.origen, route.destino);
        }
      });
    }
  }

  initializeMap(origen: { lat: number, lng: number }, destino: { lat: number, lng: number }) {
    // Inicializar el mapa de Mapbox
    this.map = new mapboxgl.Map({
      container: 'map', // ID del contenedor en el HTML
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origen.lng, origen.lat], // Centrar el mapa en el punto de origen
      zoom: 13
    });
  
    // Desactivar la interacción del usuario en el mapa
    this.map.scrollZoom.enable();
    this.map.boxZoom.disable();
    this.map.dragRotate.disable();
    this.map.dragPan.enable();
    this.map.keyboard.disable();
    this.map.doubleClickZoom.disable();
    this.map.touchZoomRotate.enable();
  
    // Agregar marcadores de origen y destino
    new mapboxgl.Marker({ color: 'green' })
      .setLngLat([origen.lng, origen.lat])
      .setPopup(new mapboxgl.Popup().setText('Origen'))
      .addTo(this.map);
  
    new mapboxgl.Marker({ color: 'red' })
      .setLngLat([destino.lng, destino.lat])
      .setPopup(new mapboxgl.Popup().setText('Destino'))
      .addTo(this.map);
  
    // Utilizar la API de rutas de Mapbox para obtener el camino entre origen y destino
    const directionsRequest = `https://api.mapbox.com/directions/v5/mapbox/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?geometries=geojson&access_token=${(mapboxgl as any).accessToken}`;
  
    fetch(directionsRequest)
      .then(response => response.json())
      .then(data => {
        const route = data.routes[0].geometry;
        
        // Agregar la ruta como una capa en el mapa
        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route,
            properties: {} // Agregar una propiedad vacía
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

    // Crear la reserva con el nombre del creador del producto
    const reservation = {
      userUid: this.user.uid,
      userName: this.user.name,
      userEmail: this.user.email,
      reservedSeats: reservedSeats,
      productId: this.product.id,
      productName: this.product.nombreRuta,
      reservationDate: new Date().toISOString(), // Almacenar la fecha de la reserva
      productCreatorUid: this.product.userUid, // UID del creador del producto
      productCreatorName: this.product.userName // Nombre del creador del producto
    };

    // Guardar la reserva en Firebase
    const reservationPath = `users/${this.user.uid}/reservations`;
    await this.firebaseSvc.addDocument(reservationPath, reservation);

    // Actualizar las unidades vendidas del producto
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
