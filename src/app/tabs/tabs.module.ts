import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsPageRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';
import { EditPageComponent } from '../customComponents/edit-page/edit-page.component';
import { ViewImageComponent } from '../customComponents/view-image/view-image.component';

@NgModule({
  entryComponents:[EditPageComponent,ViewImageComponent],
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,  // modal form component
    FormsModule,
    TabsPageRoutingModule,
  ],
  declarations: [TabsPage,EditPageComponent,ViewImageComponent]
})
export class TabsPageModule {}
