import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../../services/map.service';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  map: mapboxgl.Map;
  

  constructor(private mapService: MapService) {}

  ngOnInit() {
    // Inicializa el mapa
    this.map = new mapboxgl.Map({
      container: 'map', // ID del contenedor
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-73.0503, -36.8270], // Coordenadas iniciales
      zoom: 13, // Nivel de zoom inicial
    });

    this.configurarDirecciones();
  }

  configurarDirecciones() {
    const directions = new MapboxDirections({
      accessToken: (mapboxgl as any).accessToken,
      unit: 'metric',
      profile: 'mapbox/driving', // Solo perfil de conducción
      controls: {
        instructions: false, // Muestra las instrucciones de la ruta
        profileSwitcher: false, // Deshabilita la opción de cambiar perfiles de transporte
      },
    });

    // Añade el control de direcciones al mapa
    this.map.addControl(directions, 'top-left');

    // Puedes predefinir ubicaciones si lo deseas
    directions.setOrigin([-73.05313, -36.82892]); // Punto A
    directions.setDestination([-73.04352, -36.82885]); // Punto B
  }
}
