import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-counters-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './counters-page.component.html',
  styleUrl: './counters-page.component.scss'
})
export class CountersPageComponent {

}
