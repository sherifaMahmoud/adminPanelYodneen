import { Component } from '@angular/core';

import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { filter } from 'rxjs/operators';

import { SidebarComponent }
  from '../app/admin/Sidebar/Sidebar.component';

@Component({

  selector: 'app-root',

  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ],

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  title = 'admin-dashboard';

  showSidebar = true;

  constructor(
    private router: Router
  ) {

    this.router.events.pipe(

      filter(
        event =>
          event instanceof NavigationEnd
      )

    ).subscribe(() => {

      this.showSidebar =
        this.router.url !== '/login';
    });
  }
}