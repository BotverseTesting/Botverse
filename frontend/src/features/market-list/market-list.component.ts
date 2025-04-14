import { Component } from '@angular/core';
import { SearchBarComponent } from '../../app/shared/components/search-bar/search-bar.component';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../app/shared/components/sidebar/sidebar.component';
import { ChipsComponent } from '../../app/shared/components/chips/chips.component';
import { GridBotComponent } from "../../app/shared/components/grid-bot/grid-bot.component";

@Component({
  selector: 'market-list',
  standalone: true,
  templateUrl: './market-list.component.html',
  styleUrls: ['./market-list.component.scss'],
  imports: [
    SearchBarComponent, 
    CommonModule, 
    SidebarComponent, 
    ChipsComponent, 
    GridBotComponent
  ],
})
export class MarketListComponent {
  currentPlatform: string | null = null; 
  searchQuery: string = '';

  
  handlePlatformSelected(platform: string) {
    this.currentPlatform = platform === this.currentPlatform ? null : platform;
  }

  handleSearchChange(query: string) {
    this.searchQuery = query;
  }
}