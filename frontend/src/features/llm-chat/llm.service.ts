import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatSession {
  reply: string;
  sessionId: string;
  title: string;
}

export interface ContinueResponse {
  reply: string;
  sessionId: string;
}

@Injectable({ providedIn: 'root' })
export class LlmService {
  private apiUrl = 'http://localhost:3000/llm';

  constructor(private http: HttpClient) {}

  startChat(userId: number, title?: string): Observable<ChatSession> {
    const payload = { userId, title };
    console.log('[Service] Starting chat with:', payload);
    return this.http.post<ChatSession>(`${this.apiUrl}/start`, payload);
  }

  continueChat(sessionId: string, userMessage: string): Observable<ContinueResponse> {
    const payload = { sessionId, message: userMessage };
    console.log('[Service] Continuing chat with:', payload);
    return this.http.post<ContinueResponse>(`${this.apiUrl}/continue`, payload);
  }
  uploadWorkflow(data: any): Observable<any> {
    console.log('[Service] Uploading workflow:', data);
    return this.http.post<any>('http://localhost:3000/workflow', data);
  }
  recommendWorkflow(userId: number, goal: string): Observable<any> {
    const payload = { userId, goal };
    console.log('[Service] Recommending workflow with:', payload);
    return this.http.post<any>(`${this.apiUrl}/recommend-workflow`, payload);
  }
}
