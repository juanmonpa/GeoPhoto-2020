import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab0Page } from './tab0.page';
import { ListImagesComponent } from './list-images/list-images.component';
import { LoginComponent} from './login/login.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,  // login component
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab0Page }])
  ],
  declarations: [Tab0Page, ListImagesComponent,LoginComponent]
})

export class Tab0PageModule {
}


