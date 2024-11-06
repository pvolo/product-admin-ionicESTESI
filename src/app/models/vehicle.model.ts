// interfaces/vehicle.interface.ts
export interface Vehicle {
    id?: string; 
    licensePlate: string;
    capacity: number;
    destination: string;
    destinationCoords: {
      latitude: number;
      longitude: number;
    };
    createdBy: string; 
    startCoords: {
      latitude: number;
      longitude: number;
    };
  }
  