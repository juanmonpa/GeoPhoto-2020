import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, NavController } from '@ionic/angular';
import { Entry } from '../../model/entry';
import { BackbuttonService } from '../../services/backbutton.service';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.scss']
})
export class ViewImageComponent implements OnInit {
  entry: Entry;
  constructor(private navParams: NavParams,
    private modalController: ModalController,
    private back: BackbuttonService,
    private navCtrl: NavController) {
    this.back.openModal = true;
  }

  ngOnInit() {
    // hack for pwa. backbutton close the modal: see app.component.ts
    history.pushState({ modal: true }, 'Opening a modal', 'Modal');
    this.back.modalOpened = this;
    this.entry = this.navParams.get('entry');
  }
  public closeMe() {
    this.navCtrl.pop();
    this.modalController.dismiss({ r: false }); // updating not required
  }
}

