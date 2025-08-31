import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { CreateInstitutionComponent } from './create-institution/create-institution.component';

const routes: Routes = [
  {path:"register",component:RegisterComponent},
  {path:"login",component:LoginComponent},
  {path:"institute",component:CreateInstitutionComponent},
  {path:"",pathMatch:'full',component:RegisterComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
