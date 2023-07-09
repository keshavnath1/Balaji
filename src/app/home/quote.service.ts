import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const routes = {
  quote: (c: RandomQuoteContext) =>
    `https://geocoding-api.open-meteo.com/v1/search?name=Haymarket&language=en&format=json&country_code=us&admin1=Virginia`,
};

export interface RandomQuoteContext {
  // The quote's category: 'dev', 'explicit'...
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  constructor(private httpClient: HttpClient) {}

  getRandomQuote(context: RandomQuoteContext): Observable<string> {
    return this.httpClient.get(routes.quote(context)).pipe(
      map((body: any) => {
        console.log('body.value', body.results);
        return body.results;
      }),
      catchError(() => of('Error, could not load joke :-('))
    );
  }
}
