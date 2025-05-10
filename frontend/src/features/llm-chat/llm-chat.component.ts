import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { LlmService } from './llm.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-llm-chat',
  templateUrl: './llm-chat.component.html',
  styleUrls: ['./llm-chat.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class LlmChatComponent implements OnInit {
  sessionId: string | null = null;
  messages: Message[] = [];
  userInput: string = '';
  loading = false;
  visible = false;

  constructor(private llm: LlmService, private auth: AuthService) {}

  ngOnInit(): void {}

  openModal() {
    const userId = this.getUserIdFromToken();
    if (userId) {
      console.log('[Modal] Opening chat for user:', userId);
      this.visible = true;
      this.llm.startChat(userId, 'Asistente de bots').subscribe({
        next: (res) => {
          this.sessionId = res.sessionId;
          this.messages = [{ role: 'assistant', content: res.reply }];
        },
        error: (err) => {
          console.error('[Modal] Error starting chat:', err);
        },
      });
    }
  }

  closeModal() {
    this.visible = false;
    this.messages = [];
    this.userInput = '';
    this.sessionId = null;
  }

  sendMessage(): void {
    if (!this.sessionId || !this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.messages.push({ role: 'user', content: userMessage });
    this.userInput = '';
    this.loading = true;

    this.llm.continueChat(this.sessionId, userMessage).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', content: res.reply });
        this.loading = false;
      },
      error: (err) => {
        console.error('[Send] Error continuing chat:', err);
        this.loading = false;
      },
    });
  }

  private getUserIdFromToken(): number | null {
    const token = this.auth.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('[Token] Error parsing JWT:', e);
      return null;
    }
  }
}
