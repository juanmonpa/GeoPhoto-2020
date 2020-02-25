import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonsService } from '../../services/commons.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public registerForm: FormGroup;
  public submited: boolean;
  public submitting: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private commonS: CommonsService
  ) {
    this.submitting = false;
  }

  ngOnInit() {
    if (this.auth.isLogged()) {
      this.router.navigate(['']);
    }

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.submited = false;
  }
  public isLogging() {
    return this.submitting;
  }
  // convenience getter for easy access to form fields
  public get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    if (this.submitting) {
      return;
    }
    this.commonS.showLoading();

    this.submited = true;
    this.submitting = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      console.log('Invalid Form');
      this.submitting = false;
      return;
    }

    this.auth
      .login(this.f.email.value, this.f.password.value)
      .then(res => {
        this.commonS.hideLoading();
        this.router.navigate(['']);
        this.submitting = false;
      })
      .catch(err => {
        this.commonS.hideLoading();
        this.auth.presentAlert(); // alert changed to fit device mode
        this.submitting = false;
      });
  }

  public logingGoogle() {
    if (this.submitting) { return; }

    this.commonS.showLoading();
    this.submitting = true;
    this.auth
      .loginGoogle()
      .then(res => {
        this.commonS.hideLoading();
        this.submitting = false;
        this.router.navigate(['']);
      })
      .catch(err => {
        this.commonS.hideLoading();
        this.submitting = false;
        this.auth.presentAlert(); // alert changed to fit device mode
        console.log(err);
      });
  }
}


