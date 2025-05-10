import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl = 'http://localhost:3000/workflow'; 

  constructor(private http: HttpClient) { }

  getAllWorkflows(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(this.apiUrl);
  }
}
export interface Workflow {
    id: string;
    name: string;
    description: string;
    useCase: string;
    createdAt: Date;
    isPublic: boolean;
    tags: string[];
    configJson?: any;
    bots: {
      id: string;
      name: string;
      sourcePlatform: string;
      images: { url: string }[];
    }[];
    creator: {
      id: number;
      name: string;
    };
  }