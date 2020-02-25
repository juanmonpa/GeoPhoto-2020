import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireModule } from 'angularfire2';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Globalization } from '@ionic-native/globalization/ngx';
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { UiComponent } from './common/ui/ui.component';
import { environment } from 'src/environments/environment';
import { EntriesService } from './services/entries.service';
import { BackbuttonService } from './services/backbutton.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ViewImageComponent } from './customComponents/view-image/view-image.component';
import { CommonsService } from './services/commons.service';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { PipesModule } from './pipes/pipes.module';





export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [AppComponent, UiComponent],
  entryComponents: [],
  imports: [BrowserModule,
    ReactiveFormsModule,
    PipesModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule, //to use auth
    AngularFirestoreModule,  //to use firestore
    AngularFireStorageModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),  //to use storage

    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    GooglePlus,
    Camera,
    Vibration,
    EntriesService,
    Geolocation,
    NativeStorage,
    AuthService,
    TranslateService,
    CommonsService,
    BackbuttonService,
    HttpClient,
    Globalization,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
