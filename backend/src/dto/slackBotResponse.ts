export class SlackBotResponse {
  id: string;
  nombre: string;
  descripcion: string;
  enlace: string;
  imagen: string | null;
  categoria: string;
  precio: string;

  constructor(data: SlackBotResponse) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.enlace = data.enlace;
    this.imagen = data.imagen;
    this.categoria = data.categoria;
    this.precio = data.precio;
  }
}
export interface SlackWebsiteResponse {
  id: string;
  nombre: string;
  descripcion: string;
  enlace: string;
  imagen: string;
  categoria: string;
  precio: string;
}
