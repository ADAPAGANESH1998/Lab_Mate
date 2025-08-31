import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LabchatComponent } from './pages/labchat/labchat.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PublicationsComponent } from './pages/publications/publications.component';
import { ResearchComponent } from './pages/research/research.component';
import { CollaborationComponent } from './pages/collaboration/collaboration.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { AchievementsComponent } from './pages/achievements/achievements.component';

const routes: Routes = [
  {path:"register",component:RegisterComponent},
  {path:"login",component:LoginComponent},
  {path:"institute",component:CreateInstitutionComponent},
  {path:"",pathMatch:'full',component:RegisterComponent},
   { path: 'profile', component: ProfileComponent },
  { path: 'labchat', component: LabchatComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'publications', component: PublicationsComponent },
  { path: 'research', component: ResearchComponent },
  { path: 'collaboration', component: CollaborationComponent },
  { path: 'achievements', component: AchievementsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
