import { Component } from '@angular/core';
import { SearchBarComponent } from '../../app/shared/components/search-bar/search-bar.component';
import { ChipsComponent } from '../../app/shared/components/chips/chips.component';
import { BotCardComponent } from '../../app/shared/components/bot-card/bot-card.component';
import { SidebarComponent } from '../../app/shared/components/sidebar/sidebar.component';
import { SideImageComponent } from "../../app/shared/components/side-image/side-image.component";
import { GridBotComponent } from "../../app/shared/components/grid-bot/grid-bot.component";

@Component({
  selector: 'app-market-list',
  imports: [SearchBarComponent, BotCardComponent, SidebarComponent, GridBotComponent],
  templateUrl: './market-list.component.html',
  styleUrl: './market-list.component.scss'
})
export class MarketListComponent {

}
