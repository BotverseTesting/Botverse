import { Component } from '@angular/core';
import { BotCardComponent } from "../bot-card/bot-card.component";

@Component({
  selector: 'app-grid-bot',
  imports: [BotCardComponent,BotCardComponent],
  templateUrl: './grid-bot.component.html',
  styleUrl: './grid-bot.component.scss'
})
export class GridBotComponent {

}
