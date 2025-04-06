import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss']
})
export class ChipsComponent {
  chips = [
    { text: 'Diseño', color: '#E9B0CA' },
    { text: 'Desarrollo', color: '#9BDEC6' },
    { text: 'Testing', color: '#9BCDDE' },
    { text: 'Despliegue', color: '#DECF9B' }
  ];
}