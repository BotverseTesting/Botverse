import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../sidebar/sidebar.component';

import { SearchBarComponent } from "../../search-bar/search-bar.component";

@Component({
  selector: 'app-bot-details',
  imports: [CommonModule, SidebarComponent, SearchBarComponent],
  templateUrl: './bot-details.component.html',
  styleUrl: './bot-details.component.scss'
})
export class BotDetailsComponent {

}
