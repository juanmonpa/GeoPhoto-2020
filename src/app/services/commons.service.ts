import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommonsService {
  loadingC = null;
  /** Open a loading modal or any other modal window take some time.
   * Sometimes, app can call to show modal and, then close modal before the modal is opened.
   * To prevent keeping modal opened for this reason, we have this flag 
   */
  pendingToClose: boolean;
  constructor(public loadingController: LoadingController) { }

  // public methods
  public showLoading(msg?) {
    this.pendingToClose = false;
    // show the loading modal, see @presentLoading
    this.presentLoading(msg);
  }
  public hideLoading() {
    if (this.loadingC != null) {  // a loading is opened
      this.loadingC.dismiss();
      this.loadingC = null;
      this.pendingToClose = false;
    } else { // any loading is opened, nothing to close
      this.pendingToClose = true;
    }
  }

  private async presentLoading(msg?) {
    // if a loading is opened, any other loading must be opened
    if (this.loadingC) { this.loadingC.dismiss(); }

    // Open a native loading modal
    this.loadingC = await this.loadingController.create({
      message: msg ? msg : 'Wait, please'
    });
    await this.loadingC.present();
    // Now it is opened. If some method out there has already call to close it. Ok, tend. Let's close it.
    if (this.pendingToClose) {
      this.hideLoading();
    }
  }
}

