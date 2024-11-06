// interfaces/reservation.interface.ts
export interface Reservation {
    id?: string; // Opcional si el ID es generado automáticamente en Firebase
    vehicleId: string; // ID del vehículo reservado
    userId: string; // UID del usuario que realiza la reserva
    userName: string; // Nombre del usuario que realiza la reserva
    reservationDate: Date;
  }
  