import { Routes } from '@angular/router';
import { LoginComponent } from '../features/auth/login/login.component';
import { HomeComponent } from '../features/home/home.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { MarketListComponent } from '../features/market-list/market-list.component';
import { BotDetailsComponent } from './shared/components/bot-details/bot-details/bot-details.component';
import { UploadWorkflowComponent } from '../features/workflows/upload-workflow/upload-workflow.component';
import { WorkflowMarketplaceComponent } from '../features/workflows/workflow-marketplace/workflow-marketplace.component';
import { UserProfileComponent } from '../features/user-profile/user-profile.component';
import { AuthGuard } from '../features/auth/auth.guard';
import { LlmChatComponent } from '../features/llm-chat/llm-chat.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent }, 
    { path: 'bots', component: MarketListComponent } ,
    { path: 'bots/:id', component: BotDetailsComponent } ,
    { path: 'upload-workflow', component: UploadWorkflowComponent, canActivate: [AuthGuard] },
    { path: 'workflows', component: WorkflowMarketplaceComponent, canActivate: [AuthGuard] },
    { path: 'perfil', component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/bots' }
    
]; 

