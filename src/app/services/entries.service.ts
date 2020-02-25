import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firebase-node';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../../environments/environment';
import { Entry } from '../model/entry';
import { AuthService } from './auth.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  entriesCollection: AngularFirestoreCollection<any>; // entries collection

  uploadPercent: Observable<number>; // percent of uploading on storage service
  downloadURL: Observable<string>; // url to get pics from storage service

  entryLoaded = null; // last entry loaded
  lastEntryLoaded = null; // very last entry loaded, if this is the same that entryLoaded, there is nothing to load

  constructor(
    private fireStore: AngularFirestore,
    private auth: AuthService,
    private storage: AngularFireStorage
  ) {
    this.entriesCollection = fireStore.collection<any>(
      environment.entriesCollection // check collection permission
    );
  }

  // Get all entries. It is useful to show all them on the map.
  public getAllEntries(center?) {
    return this.entriesCollection.ref.get();
  }

  /**
   * Very importan method. Get all entries of the logged user order by date.
   * @param reload If reload is true, reload 10 entries from the beginning.
   * If it is false, load 10 more from the last loaded. This is very useful for the
   * infinite scroll component: see tab1 component.
   */
  getEntries(reload?): Promise<Entry[]> {
    if (reload) {
      // reload all from the beginning?
      this.lastEntryLoaded = null; // delete the pointer to last entry loaded
    }

    this.entryLoaded = this.lastEntryLoaded; // pointer to pointer for the next call

    // this method is asyncronous, because the response is not instantaneous
    return new Promise((resolve, reject) => {
      const lreq: Entry[] = []; // an array of entries is the response

      if (!this.auth.user) {
        reject('No logged in'); // if you are not logged, there is nothing to do here, babe
      }

      let query;
      if (this.entryLoaded == null) {
        /**
         * First, we get 10 first entries, order by date desc
         */
        query = this.entriesCollection.ref // it requires create a complex index on console <- IMPORTANT
          .where('owner', '==', this.auth.user.email)
          .orderBy('date', 'desc')
          .limit(10)
          .get();
      } else {
        /**
         * Here, we get 10 more from the last loaded firstly
         */
        query = this.entriesCollection.ref
          .where('owner', '==', this.auth.user.email)
          .orderBy('date', 'desc')
          .startAfter(this.entryLoaded)
          .limit(10)
          .get();
      }

      query.then(d => {
        // we iterate through the array
        d.forEach(u => {
          const x = { key: u.id, ...u.data() }; // create an object width key and the other fields populated
          lreq.push(x);
        });

        if (d.docs.length > 0) {
          this.lastEntryLoaded = d.docs[d.docs.length - 1]; // last entry loaded
        }
        resolve(lreq);
      });
    });
  }
  /**
   * Save a new entry or update it. When we create new one, fistly we have to store the pic in the storage service,
   * then get the download url and save all the info (title, description, url...) in firestore database.
   * @param data data to be stored or updated
   * @param key (mandatory for updating) Key of the entry to be updated
   */
  public saveEntry(data: Entry, key?: string) {
    if (key) {  // update an entry
      return this.entriesCollection.doc(key).update(data); // if image doesnt exist update fails
    } else {  // create new one
      return new Promise((resolve, reject) => {
        const fileRef = this.storage.ref(
          '/images/' +
          this.auth.user.email +
          new Date().getMilliseconds() +
          '.jpeg'
        );
        const blob = this.base64ToBlob(data.image, 'image/jpeg');
        const task = fileRef.put(blob);
        this.uploadPercent = task.percentageChanges();

        task.then(() => {
          fileRef.getDownloadURL().subscribe(
            Url => {
              data.url = Url;
              data.image = null;
              // now save entry
              this.entriesCollection.add(data).then(k => {
                console.log(k.id);
                resolve();
              });
            },
            error => {
              // Handle error here
              // Show popup with errors or just console.error
              console.error(error);
              reject('error');
            }
          );
        });
      });
    }
  }
  /**
   * For Safari on IOS
   * onFetch(event) {
   *           if (event.request.url.indexOf('firebasestorage.googleapis.com') !== -1) { return; }
   * ngsw-worker.js after building in www folder
   * @param base64
   * @param mime
   */
  private base64ToBlob(base64, mime) {
    mime = mime || '';
    const sliceSize = 1024;
    const byteChars = window.atob(base64);
    const byteArrays = [];

    for (
      let offset = 0, len = byteChars.length;
      offset < len;
      offset += sliceSize
    ) {
      const slice = byteChars.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
  }

  public removeEntry(e): Promise<any> {
    return new Promise((resolve, reject) => {
      this.removeImage(e.url).subscribe(() => {
        resolve(this.entriesCollection.ref.doc(e.key).delete());
      });
    });
  }
  /**
   * When we remove an entry, this method removes its image on storage
   * We have to transform the download URL to the name of the file in storage
   * @param url
   */
  public removeImage(url): Observable<any> {
    let name = url.substr(
      url.indexOf('%2F') + 3,
      url.indexOf('?') - (url.indexOf('%2F') + 3)
    ); // gets the name the image from the url
    name = name.replace('%40', '@'); // unescapes specials caracters from url
    const fileRef = this.storage.ref(`/images/${name}`);
    return fileRef.delete();
  }

}
