import { HttpClient } from '@angular/common/http';
import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { apiPath } from '../../api.path';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  httpClient = inject(HttpClient);
  router = inject(Router);
  destroyRef = inject(DestroyRef);



  loading = signal(false);
  error = signal<null | string>(null);

  async onSubmit(formData: NgForm) {
    if (formData.invalid) {
      for (const control of Object.keys(formData.form.controls)) {
        if (formData.form.controls[control].errors) {
          if (formData.form.controls[control].errors['required']) {
            this.error.set(`${control} is required`);
            return;
          }
        }
      }
    }
    if (
      formData.form.controls['password'].value !==
      formData.form.controls['confirmPassword'].value
    ) {
      this.error.set('passwords do not match');
      return;
    }
    this.error.set(null);

    this.loading.set(true);
    await new Promise((res) => setTimeout(res, 2000));
    this.loading.set(false);

    const body = {
      firstname: formData.form.controls['firstname'].value,
      lastname: formData.form.controls['lastname'].value,
      email: formData.form.controls['email'].value,
      password: formData.form.controls['password'].value,
      phoneNumber: formData.form.controls['phoneNumber'].value,
    };
  const subscription =   this.httpClient.post(apiPath.register, body).subscribe({
      next: (data) => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.log(error);
        this.error.set(error?.error?.message ?? 'An error occurred');
      },
    });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });

    this.router.navigate(['/']);
  }
}
