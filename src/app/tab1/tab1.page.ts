import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
/**
 * Next, we need to tell Angular to trust the dynamic image data.
 * To do this, inject DomSanitizer via the Constructor and use sanitizer.
 * bypassSecurityTrustResourceUrl() to allow the image data to be displayed in our app:
 */
import { AlertController, ModalController } from '@ionic/angular';
import { Entry } from '../model/entry';
import { CommonsService } from '../services/commons.service';
import { EditPageComponent } from '../customComponents/edit-page/edit-page.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  photo: SafeResourceUrl;
  newEntry: Entry;
  showPic = false;
  accuracy: number;
  confirmSave = false;
  watcher: any;
  picture: SafeResourceUrl;
  constructor(
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private auth: AuthService,
    private modalController: ModalController,
    private router: Router,
    private commonS: CommonsService,
    private camera: Camera,
    private geolocation: Geolocation
  ) { }
  ngOnInit() { }
  ionViewWillEnter() {
    this.accuracy = 0;
    this.newEntry = {
      owner: '',
      url: '',
      title: '',
      description: '',
      date: new Date(),
      lat: 0,
      long: 0
    };

    this.showPic = false;
    this.photo = null;
  }
  ionViewWillLeave() { }
  async ionViewDidEnter() {
    this.commonS.showLoading('Activando Cámara y Localización...');
    let coor: any;
    // Get current position
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        coor = await this.geolocation.getCurrentPosition();
      } else {  // this is a weird situation: google chrome on IOS
        coor = await this.getW3CPosition();
      }
      this.newEntry.lat = coor.coords.latitude;
      this.newEntry.long = coor.coords.longitude;
      this.accuracy = Math.round(coor.coords.accuracy);
      this.commonS.hideLoading();
      // next step
      this.addEntry();
    } catch (err) {
      this.newEntry.lat = 0;
      this.newEntry.long = 0;
      console.log(err);
      this.commonS.hideLoading();
      // next step, even though we dont have position <- this can be done better
      this.addEntry();
    }
  }

  // Next step after getting position
  async addEntry() {
    // We populate some other data to the form
    this.newEntry.owner = this.auth.user.email;
    this.newEntry.date = new Date();
    this.newEntry.url = '';
    // Time to launch camera
    await this.takePicture();
  }

  // Lauching camera
  async takePicture() {
    let image: Entry;

    await this.camera.getPicture({
      quality: 50,
      correctOrientation: true,
      targetHeight: 480,
      targetWidth: 640,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
      /*height: 600,*/

    }).then((imageData) => {
      console.log(imageData);
      image = imageData;
      this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpeg;base64,' + imageData
      );  // important to inject this image in DOM
      // asigns this one temporaly
      this.newEntry.url = 'data:image/jpeg;base64,' + imageData;
      console.log(this.newEntry.url);
      this.newEntry.image = imageData;
      console.log(this.newEntry.image);
      this.showPic = true;
      this.editModal(this.newEntry);  // show form modal
    }).catch((err) => {
      this.commonS.hideLoading();
      console.log(err);
      if (err !== 'User cancelled photos app') { // <- this can be done much better
        this.presentAlert();
      }
      this.camera.cleanup();
      this.router.navigate(['']);  // <- if error, go to tab0
    })
    /**
     * Some Capacitor plugins, including the Camera, provide the web-based functionality and UI via the Ionic PWA Elements library.
     * It's a separate dependency, so install it using the Terminal (cancel the ionic serve command currently running first):
     * npm install @ionic/pwa-elements
     * Import @ionic/pwa-elements by editing src/main.ts: import { defineCustomElements } from '@ionic/pwa-elements/loader';
     */

  }

  async getCurrentPosition() {
    try {
      const coor = await this.geolocation.getCurrentPosition();
      this.newEntry.lat = coor.coords.latitude;
      this.newEntry.long = coor.coords.longitude;
      return true;
    } catch (err) {
      return false;
    }
  }

  async presentAlert(msg?) {
    const mes = msg
      ? msg
      : 'La Cámara se ha cerrado';
    const alert = await this.alertController.create({
      header: 'Atención',
      subHeader: '',
      message: mes,
      buttons: ['OK']
    });

    await alert.present();
  }

  async editModal(e: Entry) {
    const modal = await this.modalController.create({
      component: EditPageComponent,
      componentProps: e
    });
    modal.onDidDismiss().then(() => {
      this.router.navigate(['']);
    });
    return await modal.present();
  }

  private getW3CPosition() {
    return new Promise((resolve, reject) => {
      // Try W3C Geolocation (Preferred)
      if (navigator.geolocation) {
        //alert('Geolocation is supported!');
      } else {
        alert('Geolocation is not supported for this Browser/OS.');
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve(position);
          },
          error => {
            alert(error);
            reject(error);
          },
          {}
        );

        // Try Google Gears Geolocation
      } else {
        reject();
      }
    });
  }
}

