import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LabchatComponent } from './pages/labchat/labchat.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PublicationsComponent } from './pages/publications/publications.component';
import { ResearchComponent } from './pages/research/research.component';
import { CollaborationComponent } from './pages/collaboration/collaboration.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AchievementsComponent } from './pages/achievements/achievements.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    CreateInstitutionComponent,
    HomeComponent,
    ProfileComponent,
    LabchatComponent,
    MessagesComponent,
    NotificationsComponent,
    PublicationsComponent,
    ResearchComponent,
    CollaborationComponent,
    NavbarComponent,
    SidebarComponent,
    AchievementsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
