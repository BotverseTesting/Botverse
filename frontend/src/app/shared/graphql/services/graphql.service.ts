import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { GET_BASIC_BOTS, GET_BOT_DETAILS } from '../operations/bots.operations'; 

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  constructor(private apollo: Apollo) {}

  getBasicBots(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_BASIC_BOTS,
      fetchPolicy: 'cache-first' 
    }).valueChanges;
  }
  getBotDetails(botId: string): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_BOT_DETAILS,
      variables: { 
        id: botId // Asegúrate que el ID sea string
      },
      fetchPolicy: 'cache-and-network',
      context: {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    }).valueChanges;
  }
}

