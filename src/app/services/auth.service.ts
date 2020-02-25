import { Injectable } from '@angular/core';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from '../model/user';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { CommonsService } from './commons.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // keep in RAM user credentials (email if it's logged in, null if it's not logged in, see user model interface)
  public user: User;
  firebaseg: any;

  constructor(
    private authS: AngularFireAuth,
    private router: Router,
    public alertController: AlertController,
    private googlePlus: GooglePlus,
    private firebase: AngularFireAuth,
    private commonS: CommonsService

  ) {
    this.isLogged(); // check user at the beggining
  }
  
  inicioSesion(userdata) {
    this.firebase.auth.signInWithEmailAndPassword(userdata.email,
      userdata.password)
      .then(response => {
        console.log(response);

        if (this.isLogged()) {
          this.router.navigate(['/tabs/tab0']);
          this.presentAlertAuth(userdata.email);
        }
      })
      .catch(
        error => {
          window.alert("No has podido iniciar sesión,el usuario o la contraseña no es válida o no existe")
          console.log(error);
        }
      )
  }
  async presentAlertAuth(msg?) {
    const mes = msg
      ? msg
      : 'Has iniciado sesión correctamente';
    const alert = await this.alertController.create({
      header: 'Bienvenid@',
      subHeader: '',
      message: mes,
      buttons: ['OK']
    });

    await alert.present();
  }
  /**
   * This method is not used in this app. In this app only Google crendentials are allowed
   * @param user 
   * @param pass 
   */
  async login(user: string, pass: string) {
    return new Promise(async (resolve, reject) => {
      try {
        // it uses Google auth service by user and password.
        const res = await this.authS.auth.signInWithEmailAndPassword(
          user,
          pass
        );
        this.user = res.user;
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  registroUsuario(userdata) {
    this.firebase.auth.createUserWithEmailAndPassword(userdata.email,
      userdata.password)
      .catch(error => {
        console.log(error);
      }
      )
  }
  /**
   * It is really interesting method. it tries to login by Google credentials, first by native component
   * in mobile devices, if it fails, it tries to do it by redirecting web mode, for pwa
   */
  async loginGoogle() {
    return new Promise(async (resolve, reject) => {
      this.googlePlus
        .login({
          'webClientId': '1059223010911-3h3836sev34t05rv2l4ioum6fcj6n1of.apps.googleusercontent.com',
          'offline': true,
        }) // trying native mode
        .then(res => {
          this.user = {
            email: res.email // the response is different
          };
          localStorage.setItem('user', JSON.stringify(this.user));
          resolve(true);
        }).catch(async err => {
          console.error(err); // trying pwa mode
          try {
            // it uses Google auth by google credentials with pop up window
            console.log('Trying pwa mode');
            const provider = new auth.GoogleAuthProvider();
            const res = await this.authS.auth.signInWithPopup(provider);
            this.user = res.user;
            localStorage.setItem('user', JSON.stringify(this.user));
            resolve(true);
          } catch (err) {
            console.log(err);
            reject(err);
          }
        });
    });
  }

  /**
   * it returns true is user is logged in.
   */
  public isLogged(): boolean {
    if (this.user != null) {
      return true; // it is already logged and stored in RAM (user variable)
    } else {
      // is it stored in cookies (we keep user logged in by default)?
      if (localStorage.getItem('user')) {
        this.user = JSON.parse(localStorage.getItem('user')); // ok, let's store in variable
        return true;
      } else {
        // if not in cookies, is it logged in cloud (server keeps cookies too)?
        this.authS.authState.subscribe(user => {
          if (user) {
            this.user = user; // YES, let's store in cookies and in RAM (variable)
            localStorage.setItem('user', JSON.stringify(this.user));
            return true;
          } else {
            // it is definitely not logged id. Let's remove from cookies to avoid bugs
            localStorage.removeItem('user');
            return false;
          }
        });
      }
      this.router.navigate(['login']);
    }
  }

  /**
   * Sign out in Cloud, in Cookies and in RAM. Then, user is redirected to login page.
   */
  public async logOut() {
    try {
      await this.googlePlus.logout();

      this.firebase.auth.signOut();

      this.user = null;
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    } catch (err) {
      try {
        console.log('logout pwa');
        await this.authS.auth.signOut(); // next line executed when is loggout in cloud
        this.user = null;
        localStorage.removeItem('user');
        this.router.navigate(['login']);
      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * Router Guard. This method is called from routing module.
   * If it returns true, then the page that user is trying to visit will be recheable.
   * The page won't be loaded if it returns false
   */
  public canActivate(): boolean {
    if (!this.isLogged()) {
      // this avoid bugs if user enters the url http//localhost:8100/tab2 directly.
      // The page wouldn't be recheable (thanks to routing module and canActivate call), but a blank
      // page'd be loaded. To avoid this, we make sure to redirect user to login page.
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  /**
   * we don't use other type of Router Guard, there are here only for demostration
   */
  public canActivateChild(): boolean {
    return true;
  }
  public canDeactivate(): boolean {
    return true;
  }
  public canLoad(): boolean {
    return true;
  }
  public resolve(): boolean {
    return true;
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'No Logged On',
      message:
        'User Credentials incorrect or service unavailable. Check your internet conection',
      buttons: ['OK']
    });

    await alert.present();
  }
}

