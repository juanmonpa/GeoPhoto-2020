import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, NavController } from '@ionic/angular';
import { Entry } from '../../model/entry';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntriesService } from '../../services/entries.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonsService } from '../../services/commons.service';
import { BackbuttonService } from '../../services/backbutton.service';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss']
})
export class EditPageComponent implements OnInit {
  pic: any;
  entry: Entry;
  today: Date;
  submitting = false;
  public entryForm: FormGroup;
  constructor(
    navParams: NavParams,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    public cloud: EntriesService,
    private sanitizer: DomSanitizer,
    private commonS: CommonsService,
    private back: BackbuttonService,
    private navCtrl: NavController
  ) {
    // avoid to close app when back button is pressed
    this.back.openModal = true;
    this.back.modalOpened = this;
    history.pushState({ modal: true }, 'Opening a modal', ' '); // hack for pwa. backbutton close the modal: see app.component.ts
    this.entry = {
      key: navParams.get('key'),
      owner: navParams.get('owner'),
      url: navParams.get('url'),
      title: navParams.get('title'),
      description: navParams.get('description'),
      date: navParams.get('date'),
      lat: navParams.get('lat'),
      long: navParams.get('long'),
      image: navParams.get('image')
    };

    if (this.entry.image) {
      //When entry is just created, the url field doesn't have nice value here yet
      console.log('On slow device');
      this.pic = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpeg;base64,' + this.entry.image
      );
      console.log(this.pic)
    } else {
      //When editing, yes
      this.pic = this.entry.url;
    }
    this.today = new Date();
  }

  ngOnInit() {
    this.entryForm = this.formBuilder.group({
      owner: [this.entry.owner, [Validators.required, Validators.email]],
      title: [
        this.entry.title,
        [Validators.required, Validators.maxLength(20)]
      ],
      description: [
        this.entry.description,
        [Validators.required, Validators.maxLength(100)]
      ],
      date: [
        //if it's a date we convert it to string. From database is already a string.
        this.entry.date.toISOString
          ? this.entry.date.toISOString()
          : this.entry.date,
        [Validators.required]
      ]
    });
  }

  // convenience getter for easy access to form fields
  public get f() {
    return this.entryForm.controls;
  }

  onSubmit() {
    console.log(this.f)
    if (this.submitting) {
      return;
    }

    this.submitting = true;
    // stop here if form is invalid
    if (this.entryForm.invalid) {
      console.log('Invalid Form');
      this.submitting = false;
      // alert
      return;
    }
    // update o create.
    const newEntry = {
      owner: this.entry.owner,
      url: this.entry.url,
      title: this.f.title.value,
      description: this.f.description.value,
      date: this.f.date.value,
      lat: this.entry.lat,
      long: this.entry.long,
      image: this.entry.image
    };
    this.commonS.showLoading("Guardando imagen...");
    if (this.entry.key) {
      newEntry.image = null;
      this.cloud
        .saveEntry(newEntry, this.entry.key)
        .then(() => {
          this.commonS.hideLoading();
          this.modalController.dismiss({ r: true }); // updating required, it is read on dismiss this modal
        })
        .catch(err => {
          console.log(err);
          this.commonS.hideLoading();
        });
    } else {
      this.cloud
        .saveEntry(newEntry)
        .then(() => {
          this.commonS.hideLoading();
          this.modalController.dismiss({ r: true }); // updating required
        })
        .catch(err => {
          console.log(err);
          this.commonS.hideLoading();
        });
    }
  }
  public closeMe() {
    this.navCtrl.pop();
    this.modalController.dismiss({ r: false }); // updating not required
  }
}

