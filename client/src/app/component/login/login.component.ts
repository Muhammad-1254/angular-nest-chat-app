import { HttpClient } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { apiPath } from '../../api.path';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly httpClient = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  loading = signal<boolean>(false);
  error = signal<string | undefined>(undefined);
  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });
  constructor() {
    afterNextRender(() => {
      const savedForm = localStorage.getItem('saved-login-form');
      if (savedForm) {
        // TODO: remove this password field
        const { email, password } = JSON.parse(savedForm);
        this.form.controls.email.setValue(email);
        this.form.controls.password.setValue(password);
      }
      const subscription = this.form.valueChanges
        .pipe(debounceTime(500))
        .subscribe({
          next: (value) => {
            const savedEmail = JSON.stringify(value);
            localStorage.setItem('saved-login-form', savedEmail);
          },
          error: (err) => {
            console.log(err);
          },
        });
      this.destroyRef.onDestroy(() => {
        subscription?.unsubscribe();
      });
    });
  }

  get emailIsInvalid() {
    return (
      this.form.controls.email.invalid &&
      this.form.controls.email.touched &&
      this.form.controls.email.dirty
    );
  }
  get passwordIsInvalid() {
    return (
      this.form.controls.password.invalid &&
      this.form.controls.password.touched &&
      this.form.controls.password.dirty
    );
  }

 async onSubmit() {
    if (this.form.invalid) {
      for (const control of Object.entries(this.form.controls)) {
        if(control[1].errors){
          if(control[1].errors['required']){
            this.error.set(`${control[0]} is required`);
            return;
          }
        }
      }
    }
    this.error.set(undefined);
    this.loading.set(true);
    const body = {
      email:this.form.controls.email.value?.trim(),
      password:this.form.controls.password.value?.trim()

    }
    const subscription = this.httpClient.post(apiPath.login,body,{
      withCredentials:true,
      // observe:'response',
    })
    .subscribe({

      next:(data)=>{
        // if(data.ok|| data.status === 200){
          this.authService.setIsAuth(true);
          // this.router.navigate(['/']);
        // }
      },
      error:(err)=>{
        console.log("error from login: ",err)
        this.error.set(err?.error?.message?? "An error occurred")
      }
    })
    this.loading.set(false);

    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe()
    })


    // now redirect to the home page
    // this.form.reset()
    // this.router.navigate(['/']);

  }
}
