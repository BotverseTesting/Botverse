import { Component } from '@angular/core';
import { BotCardComponent, BotCard } from '../bot-card/bot-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-bot',
  standalone: true,
  imports: [CommonModule, BotCardComponent],
  templateUrl: './grid-bot.component.html',
  styleUrls: ['./grid-bot.component.scss'],
})
export class GridBotComponent {
  bots: BotCard[] = [
    {
      id: 1,
      header: 'Marketing Bot',
      category: 'Marketing',
      labels: ['Ads', 'SEO', 'Campaigns'],
      isFavorite: false,
    },
    {
      id: 2,
      header: 'Support Bot',
      category: 'Customer Service',
      labels: ['Chat', 'FAQ'],
      isFavorite: true,
    },
    {
      id: 3,
      header: 'Analytics Bot',
      category: 'Data',
      labels: ['Reports', 'Insights'],
      isFavorite: false,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
    {
      id: 4,
      header: 'DevOps Bot',
      category: 'Infrastructure',
      labels: ['CI/CD', 'Monitoring'],
      isFavorite: true,
    },
  ];

  selectedBotId: number | null = null;

  selectBot(id: number) {
    this.selectedBotId = id;
  }

  toggleFavorite(id: number) {
    const bot = this.bots.find(b => b.id === id);
    if (bot) {
      bot.isFavorite = !bot.isFavorite;
    }
  }
}
