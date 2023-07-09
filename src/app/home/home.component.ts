import { finalize } from 'rxjs/operators';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { of, throwError } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter, catchError, switchMap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QuoteService } from './quote.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('movieSearchInput', { static: true })
  movieSearchInput!: ElementRef;
  apiResponse: any;
  isSearching: boolean;

  quote: string | undefined;
  isLoading = false;
  constructor(private httpClient: HttpClient, private quoteService: QuoteService, private router: Router) {
    this.isSearching = false;
    this.apiResponse = [];
  }

  ngOnInit() {
    this.isLoading = true;
    this.quoteService
      .getRandomQuote({ category: 'dev' })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((quote: any) => {
        console.log(quote);
        //this.quote = quote;
      });

    fromEvent(this.movieSearchInput.nativeElement, 'keyup')
      .pipe(
        map((event: any) => event.target.value),
        filter((res) => res.length > 2),
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((term: string) => {
          this.isSearching = true;
          return this.searchGetCall(term);
        })
      )
      .subscribe({
        next: (res) => {
          this.isSearching = false;
          this.apiResponse = res['results'];
          console.log(res);
        },
        error: (err) => {
          this.isSearching = false;
          console.error('error', err);
        },
      });
  }

  callBackend(data: any) {
    // route to new page with data

    this.router.navigate(['/result', data.latitude, data.longitude]);

    let params = new HttpParams()
      .set('latitude', data.latitude)
      .set('longitude', data.longitude)
      .set('current_weather', true);
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
          this.isSearching = false;
          this.apiResponse = res['current_weather'];
          console.log(res);
        },
        error: (err) => {
          this.isSearching = false;
          console.error('error', err);
        },
      });
  }

  searchGetCall(term: string) {
    if (term === '') {
      return of([]);
    }

    let params = new HttpParams().set('name', term);

    return this.httpClient.get('https://geocoding-api.open-meteo.com/v1/search/', { params }).pipe(
      catchError((error) => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
}
