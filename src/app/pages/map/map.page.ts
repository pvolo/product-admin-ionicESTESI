import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../../services/map.service';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router'; // Importa Router

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  map: mapboxgl.Map;
  directions: MapboxDirections;
  routeName: string = ''; 

  constructor(private mapService: MapService, private afAuth: AngularFireAuth,    private router: Router 
  ) {}

  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-73.0503, -36.8270], 
      zoom: 13, 
    });

    this.configureDirections();
  }

  configureDirections() {
    this.directions = new MapboxDirections({
      accessToken: (mapboxgl as any).accessToken,
      unit: 'metric',
      profile: 'mapbox/driving', 
      controls: {
        instructions: false, 
        profileSwitcher: false, 
      },
    });

    this.map.addControl(this.directions, 'top-left');

    this.directions.setOrigin([-73.05313, -36.82892]); 
    this.directions.setDestination([-73.04352, -36.82885]); 
  }

  saveRoute() {
    this.afAuth.currentUser.then(user => {
      if (!user) {
        alert('Por favor, inicie sesión para guardar la ubicación.');
        return;
      }
  
      if (!this.routeName.trim()) {
        alert('Por favor, ingrese un nombre para la ruta.');
        return;
      }
  
      const origin = this.directions.getOrigin().geometry.coordinates;
      const destination = this.directions.getDestination().geometry.coordinates;
  
      this.mapService.guardarUbicacion(
        { lat: origin[1], lng: origin[0] }, 
        { lat: destination[1], lng: destination[0] }, 
        this.routeName
      ).then(() => {
        alert('Ubicación guardada exitosamente! Puedes Cerrar esta pestaña');
      }).catch((error) => {
        console.error(error);
        alert('Error al guardar la ubicación.');
      });
    });
  }
  volverAlInicio() {
    this.router.navigate(['./main/home']);
  }
}
