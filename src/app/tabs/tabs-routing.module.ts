import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthService } from '../services/auth.service';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab0',
        children: [
          {
            path: '',
            loadChildren:  () => import('../tab0/tab0.module').then(m => m.Tab0PageModule)
          }
        ]
      },
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren:  () => import('../tab1/tab1.module').then(m => m.Tab1PageModule),
            canActivate: [AuthService]
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren:  () => import('../tab2/tab2.module').then(m => m.Tab2PageModule),
            canActivate: [AuthService]
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/tab0',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab0',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}



