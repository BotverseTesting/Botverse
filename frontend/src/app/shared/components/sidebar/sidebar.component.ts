import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() activePlatform: string | null = null; 
  @Output() platformSelected = new EventEmitter<string>(); 
  isCollapsed = true; 

  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  selectPlatform(platform: string) {
    this.platformSelected.emit(platform);
  }
}