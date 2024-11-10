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
      // Carga los datos de la ubicación asociados a la ruta
      this.routeData$ = this.firebaseSvc.getUbicacionPorNombreRuta(this.user.uid, this.product.nombreRuta);
      this.routeData$.subscribe(route => {
        if (route) {
          this.initializeMap(route.origen, route.destino);
        }
      });
    }
  }

  initializeMap(origen: { lat: number, lng: number }, destino: { lat: number, lng: number }) {
    this.map = new mapboxgl.Map({
      container: 'map', // ID del contenedor en el HTML
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [origen.lng, origen.lat], // Centra el mapa en el punto de origen
      zoom: 13
    });
  
    // Marcador para el origen
    new mapboxgl.Marker({ color: 'green' })
      .setLngLat([origen.lng, origen.lat])
      .setPopup(new mapboxgl.Popup().setText('Origen'))
      .addTo(this.map);
  
    // Marcador para el destino
    new mapboxgl.Marker({ color: 'red' })
      .setLngLat([destino.lng, destino.lat])
      .setPopup(new mapboxgl.Popup().setText('Destino'))
      .addTo(this.map);
  
    // Añadir línea de conexión entre los puntos
    this.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [origen.lng, origen.lat],
            [destino.lng, destino.lat]
          ]
        },
        properties: {} // Añadido para cumplir con el tipo esperado
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
          'line-color': '#ff8800', // Color de la línea
          'line-width': 4
        }
      });
    };
  

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

      // Crear la reserva
      const reservation = {
        userUid: this.user.uid,
        userName: this.user.name,
        userEmail: this.user.email,
        reservedSeats,
        productId: this.product.id,
        productName: this.product.name
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
