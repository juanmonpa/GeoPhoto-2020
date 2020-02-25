import { Injectable } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { Plugins, AppState } from '@capacitor/core';
const { App } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class BackbuttonService {
  currentURL: any = '';
  openModal = false;
  modalOpened: any;

  /* This service manages backbutton */
  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private router: Router
  ) { }

  backButton() {
    /*Cordova solution
    this.platform.backButton.subscribe(()=>{
      console.log("back button from old scholl")
    })*/

    // PWA avoid user to exit with first back button
    window.addEventListener('load', () => {
      window.history.pushState({ noBackExitsApp: true }, '');
    });
    // PWA backbutton solution: close modal
    window.addEventListener('popstate', (s) => {
      if (this.openModal) {
        this.modalOpened.closeMe();  //see modal components
        this.openModal = false;
      } else {
        this.router.navigate(['']);
      }
    });

    // App
    App.addListener('backButton', (data: any) => {
      console.log('back button pressed');
      if (!this.openModal) {  // any modal is opened
        if ( // we are at home
          this.currentURL === '/' ||
          this.currentURL === '' ||
          this.currentURL === '/tabs' ||
          this.currentURL === '/tabs/tab0'
        ) {
          App.exitApp();
        } else { // we are in any other tab
          this.router.navigate(['']);
        }
      } else { // a modal is open, close it
        this.openModal = false;  // this solution doesn't work in modals nested. Our app has just a modal at a time
        if (this.modalOpened && this.modalOpened.closeMe) {
          this.modalOpened.closeMe();
        }
      }
    });

    // This code allows us to know current url.
    // When app navigates, the current url takes some time to be updated: observable
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // this is executed when navigation ends
        this.currentURL = event.url;
      }
    });
  }
}


