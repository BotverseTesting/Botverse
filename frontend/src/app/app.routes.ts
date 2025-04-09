import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { HomeComponent } from '../features/home/home.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { MarketListComponent } from '../features/market-list/market-list.component';
import { BotDetailsComponent } from './shared/components/bot-details/bot-details/bot-details.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent }, 
    { path: 'bots', component: MarketListComponent } ,
    { path: 'bots/details', component: BotDetailsComponent } ,
    
]; 

