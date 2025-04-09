import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { ChipsComponent } from "../../chips/chips.component";

@Component({
  selector: 'app-bot-details',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './bot-details.component.html',
  styleUrl: './bot-details.component.scss'
})
export class BotDetailsComponent {

}
