import { NgModule, Component, Injectable } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import {
  HttpClientJsonpModule,
  HttpClientModule,
  HttpClient
} from "@angular/common/http";

class SearchItem {
  constructor(
    public track: string,
    public artist: string,
    public link: string,
    public thumbnail: string,
    public artistId: string
  ) {}
}

@Injectable()
export class SearchService {
  apiRoot: string = "https://itunes.apple.com/search";
  results: any;
  loading: boolean;
 
  constructor(private http: HttpClient) {
    this.results = [];
    this.loading = false;
  }

  search(term: string) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = `${this.apiRoot}?term=${term}&media=music&limit=20`;
      this.http
        .jsonp(apiURL, "callback")
        .toPromise()
        .then(
          res => {
            // Success
            this.results = res.result.map(item => {
              return new SearchItem(
                item.trackName,
                item.artistName,
                item.trackViewUrl,
                item.artworkUrl30,
                item.artistId
              );
            });
            resolve();
          },
          msg => {
            // Error
            reject(msg);
          }
        );
    });
    return promise;
  }
}

@Component({
  selector: "app",
  template: ` 
<form class="form-inline">
	<div class="form-group">
		<input type="search"
		       class="form-control"
		       placeholder="Enter search string"
		       #search>
	</div>
	<button type="button" class="btn btn-primary" (click)="doSearch(search.value)">Search</button>
</form>
<hr/>
<div class="text-center">
  <p class="lead" *ngIf="loading">Loading...</p>
</div>
<ul class="list-group">
	<li class="list-group-item"
	    *ngFor="let track of itunes.results">
		<img src="{{track.thumbnail}}">
		<a target="_blank"
		   href="{{track.link}}">{{ track.track }}
		</a>
	</li>
</ul>
 `
})
export class AppComponent {
  private loading: boolean = false;

  constructor(private itunes: SearchService) {}

  doSearch(term: string) {
    this.loading = true;
    this.itunes.search(term).then(_ => (this.loading = false));
  }
}
