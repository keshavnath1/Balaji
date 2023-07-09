import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit {
  apiResponse: any;
  constructor(private router: ActivatedRoute, private httpClient: HttpClient) {
    this.apiResponse = [];
  }

  ngOnInit(): void {
    const { latitude, longitude } = this.router.params['value'];

    let params = new HttpParams().set('latitude', latitude).set('longitude', longitude).set('current_weather', true);
    //.set('daily', "temperature_2m_max");
    //latitude=52.52&longitude=13.41&hourly=temperature_2m
    this.httpClient
      .get('https://api.open-meteo.com/v1/forecast', { params })
      .pipe(
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        })
      )
      .subscribe({
        next: (res) => {
          this.apiResponse = res['current_weather'];
          console.log(res);
        },
        error: (err) => {
          console.error('error', err);
        },
      });
  }
}
