import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RoomsPage } from './rooms.page';
import { CreateRoomComponent } from '../../components/create-room/create-room.component';
import { RoomsComponent } from '../../components/rooms/rooms.component';

const routes: Routes = [
  {
    path: '',
    component: RoomsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RoomsPage, RoomsComponent, CreateRoomComponent]
})
export class RoomsPageModule {}
