import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-bot-card',
  templateUrl: './bot-card.component.html',  // Corregido templateUrl -> templateUrls
  styleUrls: ['./bot-card.component.scss'],  // Corregido styleUrl -> styleUrls
  imports: [
    CommonModule,BotCardComponent
  ]
})
export class BotCardComponent {
  // Datos de ejemplo
  data = {
    name: 'Example Company',
    logoUrl: 'https://via.placeholder.com/150', // URL de la imagen de ejemplo para el logo
    bannerUrl: 'https://via.placeholder.com/600x200', // URL de la imagen de ejemplo para el banner
    tags: ['Tech', 'Startup'],
    description: 'Example description of a company. This is a placeholder text to simulate the content.'
  };

  // Método para gestionar el error en la carga de las imágenes
  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/150'; // Imagen por defecto si la carga falla
  }

  // Método para obtener la clase del tag según el tipo
  getTagClass(tag: string): string {
    switch (tag) {
      case 'Tech':
        return 'bg-blue-200 text-blue-800';
      case 'Startup':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }
}
