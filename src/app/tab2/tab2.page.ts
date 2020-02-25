import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { EntriesService } from '../services/entries.service';
import { ViewImageComponent } from '../customComponents/view-image/view-image.component';
import { ModalController } from '@ionic/angular';
import { CommonsService } from '../services/commons.service';
/**
 * npm install leaflet --save
 * In angular.json -> 
 * "assets": [
 *     ...,
 *     {
 *       "glob": "**\/*",
 *       "input": "./node_modules/leaflet/dist/images",
 *       "output": "leaflet/"
 *     }
 *   ],
 *   "styles": [
 *     ...,
 *     "./node_modules/leaflet/dist/leaflet.css"
 *   ],
 */
import * as L from 'leaflet';
/**
*  https://github.com/Leaflet/Leaflet.markercluster
*  npm install @types/leaflet
*  npm install leaflet.markercluster
*  npm install --save @types/leaflet.markercluster
*  npm install --save @types/node
*/
import 'leaflet.markercluster';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  /** to load leaflet map */
  map: L.Map;
  constructor(
    private cloud: EntriesService,
    private modalController: ModalController,
    private commonS: CommonsService,
    private geolocation: Geolocation
  ) { }

  async ionViewDidEnter() {
    this.commonS.showLoading('Activando Localización...');
    let coor;
    try {

      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        coor = await this.geolocation.getCurrentPosition();  // original method to get current position with Capacitor
        coor = coor.coords;
      } else {  // for some weid situations, such as Chome on IOS
        coor = await this.getW3CPosition();
        coor = coor.coords;
      }
      this.commonS.hideLoading();
      this.loadMap(coor)
        .then(() => {
          // this.loadAllData(); <--if we don't use clusters
          this.loadClusters();
        })
        .catch(err => {
          console.log(err);
        });
    } catch (err) {
      coor = {
        latitude: 0,
        longitude: 0
      };
      console.log(err);
      this.commonS.hideLoading();
      this.loadMap(coor)
        .then(() => {
          console.log('load mapa');
          // this.loadAllData(); <--if we don't use clusters
          this.loadClusters();
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  async loadMap(coor) {
    // We load leafmap centered on our current position, with zoom 14
    this.map = new L.Map('map').setView(
      [coor.latitude, coor.longitude],
      14 // current zoom, about a medium size city, before 12
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: `<div style="text-align:center;display:inline-block">Map data &copy;
        <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors<br>
        <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery ©
        <a href="https://www.mapbox.com/">Mapbox</a><br> Inspired by Developodo ;)</div>`,
      maxZoom: 19 // before 18
    }).addTo(this.map);  // add to div, see tab3.page.html
  }

  loadClusters() {
    const markers = L.markerClusterGroup({ animateAddingMarkers: true, chunkedLoading: true });
    this.cloud
      .getAllEntries()
      .then(d => {
        const customMarkerIcon = L.icon({
          iconUrl: '/assets/iconmap.png',
          iconSize: [32, 32],
          popupAnchor: [0, -20]
        });

        d.docs.forEach(e => {
          const entry = e.data();
          if (entry != null && entry.lat) {
            console.log(entry)
            const mmarker = L.marker(L.latLng(entry.lat, entry.long), {
              icon: customMarkerIcon,
              title: e.data().title
            })
              .bindPopup(
                e.data().owner +
                '<br>' +
                e.data().title +
                '<br>' +
                e.data().date +
                '<hr>' +
                e.data().description
              )
              .openPopup()
              .on('click', () => this.viewImage(entry));
            markers.addLayer(mmarker);
          }
        });
        this.map.addLayer(markers);

        this.map.on('moveend', () => {
          /**
           * This is useful for geofire, here this is not useful
           */
          console.log(this.map.getCenter().toString());
          console.log(this.map.getZoom().toString());
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * this method is not used. It is a sample to make markers without clusters
   */
  loadAllData() {
    const customMarkerIcon = L.icon({
      iconUrl: '/assets/iconmap.png',
      iconSize: [32, 32],
      popupAnchor: [0, -20]
    });
    this.cloud
      .getAllEntries()
      .then(d => {
        d.docs.forEach(e => {
          const m = L.marker([e.data().lat, e.data().long], {
            icon: customMarkerIcon
          })
            .addTo(this.map)
            .bindPopup(e.data().title + '<br>' + e.data().date, {
              autoClose: false
            })
            .openPopup()
            .on('click', () => this.viewImage(e.data().url));
        });
        this.map.on('moveend', () => {
          console.log(this.map.getCenter().toString());
          console.log(this.map.getZoom().toString());
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  /**
   * Show the image in the modal ViewImageComponent
   * @param u 
   */
  async viewImage(u: any) {
    const modal = await this.modalController.create({
      component: ViewImageComponent,
      componentProps: { entry: u }
    });
    return await modal.present();
  }

  /** Remove map when we have multiple map object */
  ionViewWillLeave() {
    if (this.map && this.map.remove) {
      this.map.remove();
    }
  }

  private getW3CPosition() {
    return new Promise((resolve, reject) => {
      // Try W3C Geolocation (Preferred)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve(position);
          },
          error => {
            reject(error);
          },
          {}
        );
      } else {
        reject();
      }
    });
  }
}