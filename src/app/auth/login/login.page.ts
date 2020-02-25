import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonsService } from 'src/app/services/commons.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  userdata: any;
  mensaje = false;
  submitting: boolean;

  constructor(private formBuilder: FormBuilder,
    private autService: AuthService,
    private router: Router,
    private commonS: CommonsService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      'email': ['', [
        Validators.required,
        Validators.email]
      ],
      'password': ['', [
        Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6)]
      ]
    });
  }
  onSubmit() {
    this.userdata = this.saveUserdata();
    this.autService.inicioSesion(this.userdata);
    setTimeout(() => {
      if (this.isAuth() === false) {
        this.mensaje = true
        window.alert("NO HAS PODIDO INICIAR SESION");
      };
    }, 2000);

  }
  saveUserdata() {
    const saveUserdata = {
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value,
    };
    return saveUserdata;
  }
  isAuth(): boolean {
    return this.autService.isLogged();
  }
  public logingGoogle() {
    if (this.submitting) { return; }

    this.commonS.showLoading("Cargando...");
    this.submitting = true;
    this.autService
      .loginGoogle()
      .then(res => {
        this.commonS.hideLoading();
        this.submitting = false;
        this.router.navigate(['']);
      })
      .catch(err => {
        this.commonS.hideLoading();
        this.submitting = false;
        this.autService.presentAlert(); // alert changed to fit device mode
        console.log(err);
      });
  }

}
