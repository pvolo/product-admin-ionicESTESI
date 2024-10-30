export interface User{
    uid:string,
    email:string,
    password:string,
    name:string,
    image:string,
    rut?: string;         // Campo opcional para el RUT
    birthdate?: string;    // Campo opcional para la fecha de nacimiento
}