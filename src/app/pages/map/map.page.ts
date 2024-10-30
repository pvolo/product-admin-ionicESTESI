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
  routeName: string = ''; // To store the name of the route entered by the user

  constructor(private mapService: MapService, private afAuth: AngularFireAuth,    private router: Router 
  ) {}

  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    // Initialize the map
    this.map = new mapboxgl.Map({
      container: 'map', // Container ID
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-73.0503, -36.8270], // Initial coordinates
      zoom: 13, // Initial zoom level
    });

    this.configureDirections();
  }

  configureDirections() {
    this.directions = new MapboxDirections({
      accessToken: (mapboxgl as any).accessToken,
      unit: 'metric',
      profile: 'mapbox/driving', // Driving profile only
      controls: {
        instructions: false, // Show route instructions
        profileSwitcher: false, // Disable profile switcher
      },
    });

    // Add the directions control to the map
    this.map.addControl(this.directions, 'top-left');

    // Set default locations if desired
    this.directions.setOrigin([-73.05313, -36.82892]); // Point A
    this.directions.setDestination([-73.04352, -36.82885]); // Point B
  }

  saveRoute() {
    this.afAuth.currentUser.then(user => {
      if (!user) {
        alert('Por favor, inicie sesión para guardar la ubicación.');
        return;
      }
  
      // Continuar con el guardado
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
        alert('Ubicación guardada exitosamente!');
      }).catch((error) => {
        console.error(error);
        alert('Error al guardar la ubicación.');
      });
    });
  }
  // Método para redirigir al inicio
  volverAlInicio() {
    this.router.navigate(['./main/home']);
  }
}
