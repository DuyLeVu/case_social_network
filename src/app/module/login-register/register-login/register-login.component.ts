import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {first} from "rxjs";
import {AuthenticationService} from "../../../service/authentication.service";
import {UserService} from "../../../service/user.service";
import {JWTResponse} from "../../../model/JWTResponse";
import * as moment from 'moment';
declare var $:any;
@Component({
  selector: 'app-register-login',
  templateUrl: './register-login.component.html',
  styleUrls: ['./register-login.component.css']
})
export class RegisterLoginComponent implements OnInit {
  min:string ="" ;
  max:string ="";
  userName="";
  currentUser: any;
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('',[Validators.required]),
    password: new FormControl('',[Validators.required, Validators.minLength(6),Validators.maxLength(32)])
  });
  registerForm: FormGroup = new FormGroup({
    newUserName: new FormControl('',[Validators.required]),
    newPassWord: new FormControl('',[Validators.required, Validators.minLength(6),Validators.maxLength(32)]),
    newConfirmPassWord: new FormControl('',[Validators.required, Validators.minLength(6),Validators.maxLength(32)]),
    newEmail: new FormControl('',[Validators.required, Validators.email]),
    newPhoneNumber: new FormControl('',[Validators.required, Validators.pattern('^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$')]),
    newDateOfBirth: new FormControl('',[Validators.required]),
  })
  // @ts-ignore
  returnUrl: string;
  // @ts-ignore
  adminUrl: string;
  error = '';
  loading = false;
  submitted = false;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService,
              private userService: UserService) {
    this.min= moment(moment().subtract(29200, 'days').calendar()).format("YYYY-MM-DD")
    this.max= moment(moment().subtract(5840, 'days').calendar()).format("YYYY-MM-DD")
    localStorage.clear();
  }

  ngOnInit() {
    // this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    this.returnUrl = 'user/user-detail/timeline';
    this.adminUrl = '/admin'
  }

  login(): void {
    this.submitted = true;
    this.loading = true;
    this.authenticationService.login(this.loginForm.value)
      .subscribe((data: JWTResponse) => {
        console.log(data)
          localStorage.setItem('currentUser', JSON.stringify(data));
          localStorage.setItem('ACCESS_TOKEN', data.token);
          // localStorage.setItem('ROLE', data.roles[0].authority);
          localStorage.setItem('USERNAME', data.username);
          localStorage.setItem('USERID', data.id + "");
          if (data.roles[0].authority == "ROLE_ADMIN") {
            this.router.navigate([this.adminUrl])
          } else {
            this.userService.getUserProfile(data.id+"").subscribe(result => {
              this.currentUser = result;
              localStorage.setItem('currentUser',JSON.stringify(result));
              this.userName=data.username;
              $('#exampleModal').modal('show')
              setTimeout( () => {$('#exampleModal').modal('hide');this.router.navigate([this.returnUrl])},2000)

            }, error => {
              console.log(error);
            })
            }
        },
        () => {
          $('#error').modal('show')
          // alert("Tài khoản của bạn đã bị khoá hoặc sai mật khẩu!");
          this.loading = false;
        });
  }

  register() {
    let newUser = {
      username: this.registerForm.value.newUserName,
      password: this.registerForm.value.newPassWord,
      confirmPassword: this.registerForm.value.newConfirmPassWord,
      email: this.registerForm.value.newEmail,
      phone: this.registerForm.value.newPhoneNumber,
      dateOfBirth: this.registerForm.value.newDateOfBirth,
    }
    console.log(newUser)
    this.userService.register(newUser).subscribe(
      success => {
        $('#registerSuccess').modal('show')
        setTimeout( () => {$('#registerSuccess').modal('hide');$("#showLogin").click()},2000)
        this.loginForm = new FormGroup({
          username: new FormControl(this.registerForm.value.newUserName,[Validators.required]),
          password: new FormControl(this.registerForm.value.newPassWord,[Validators.required, Validators.minLength(6),Validators.maxLength(32)])
        });
        this.registerForm.reset()
      }, error1 => {
        $('#registerFail').modal('show')
      }
    )
  }
  showLogin(){
    $("#showLogin").click();
  }
}
