import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Entry } from '../../model/entry';
import { EntriesService } from '../../services/entries.service';
import { IonInfiniteScroll, ModalController, AlertController } from '@ionic/angular';
import { EditPageComponent } from '../../customComponents/edit-page/edit-page.component';
import { IonVirtualScroll } from '@ionic/angular';
import { ViewImageComponent } from 'src/app/customComponents/view-image/view-image.component';
import { CommonsService } from '../../services/commons.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Vibration } from '@ionic-native/vibration/ngx';

@Component({
  selector: 'app-list-images',
  templateUrl: './list-images.component.html',
  styleUrls: ['./list-images.component.scss']
})
export class ListImagesComponent implements OnInit {
  @ViewChild('infiniteScroll', null) ionInfiniteScroll: IonInfiniteScroll;
  @ViewChild(IonVirtualScroll, null) virtualScroll: IonVirtualScroll;
  resetInfinityScroll: IonInfiniteScroll;
  myEntries: Entry[] = [];

  constructor(
    public auth: AuthService,
    public cloud: EntriesService,
    public modalController: ModalController,
    private alertController: AlertController,
    private commonS: CommonsService,
    private vibration: Vibration
  ) { }

  ngOnInit() {
    this.loadEntries();
    // important to do it here, when dom is made. infinite scroll need this solution
  }

  public cerrarSesion() {
    this.auth.logOut();
  }

  public async loadEntries() {
    this.commonS.showLoading("Cargando...");
    this.myEntries = await this.cloud.getEntries(true);
    // next line is very important to update dinamic content into virtualscroll
    this.virtualScroll.checkEnd();
    this.commonS.hideLoading();
    // hide loading
  }
  public async refreshEntries(e) {
    await this.loadEntries();
    // close the refresher
    e.target.complete();
  }
  public async loadMoreEntries(e) {
    this.commonS.showLoading("Cargando...");
    const newEntries = await this.cloud.getEntries(false); // to add more
    if (newEntries.length > 0) {
      this.myEntries = this.myEntries.concat(newEntries);
      this.virtualScroll.checkEnd();
    }
    this.commonS.hideLoading();
    e.target.complete();
  }

  async editModal(e: Entry) {
    const modal = await this.modalController.create({
      component: EditPageComponent,
      componentProps: e
    });
    modal.onDidDismiss().then(d => {
      if (d && d.data && d.data.r) {
        this.loadEntries();
      }
    });
    return await modal.present();
  }

  async viewImage(e: Entry) {
    const modal = await this.modalController.create({
      component: ViewImageComponent,
      componentProps: { entry: e }
    });
    modal.onDidDismiss().then(d => { });
    return await modal.present();
  }

  public removeEntry(e) {
    this.vibration.vibrate([1000]);
    this.presentAlertConfirm(e);
  }

  async presentAlertConfirm(e) {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: '¿Eliminar <strong>' + e.title + '</strong>?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: blah => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.commonS.showLoading();
            this.cloud.removeEntry(e).then(() => {
              this.commonS.hideLoading();
              this.loadEntries();
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
