import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../../service/user.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {user} from "@angular/fire/auth";

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.css']
})
export class EditPasswordComponent implements OnInit {
  currentUser: any
  avatar: string = "";
  cover: string = "";
  url: string = "null";
  updateForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
  });

  constructor(private router: Router,
              private userService: UserService,
  ) {
    if (localStorage.getItem('currentUser') == null) {
      this.router.navigate([''])
    }
    // @ts-ignore
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.userService.getUserProfile(this.currentUser.id).subscribe(result => {
      this.currentUser = result;
      this.avatar = this.currentUser.avatar;
      this.cover = this.currentUser.cover;
    }, error => {
      console.log(error);
    })
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/'])
  }

  ngOnInit(): void {
  }

  update(): void {

    let user1 = {
      id: localStorage.getItem('USERID'),
      password: this.updateForm.value.password
    }
    // @ts-ignore
    this.userService.matchPassword(user1).subscribe(result => {
      this.currentUser.password = this.updateForm.value.newPassword;
      this.currentUser.confirmPassword = this.updateForm.value.newPassword;
      if (this.updateForm.value.newPassword == this.updateForm.value.confirmPassword) {
        this.userService.updateUserProfile(this.currentUser.id, this.currentUser).subscribe(result1 => {
          console.log("sửa thành công")
        }, error => {
          console.log("lol")
        });
      } else console.log("wrong confirm password")
    }, error => {
      console.log("wrong old password");
    })
  }
}
