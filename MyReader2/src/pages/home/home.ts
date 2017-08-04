import { Component, ViewChild } from '@angular/core';
import { NavController, LoadingController, ActionSheetController, Content } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { RedditService } from "../../providers/reddit-service/reddit-service";
import { FormControl } from "@angular/forms";
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';




@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  public feeds: Array<any>;
  private url: string = "https://www.reddit.com/new.json";
  private olderPosts: string = "https://www.reddit.com/new.json?after=";
  public noFilter: Array<any>;
  public hasFilter: boolean = false;
  public searchTerm: string = "";
  public searchTermControl: FormControl;
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public http: Http, public loadingCtrl: LoadingController, public actionSheetCtrl: ActionSheetController, public redditService: RedditService) {

    this.fetchContent();

    this.searchTermControl = new FormControl();
    this.searchTermControl.valueChanges.debounceTime(40000).distinctUntilChanged().subscribe(search => {
      if (search !== '' && search) {
        this.filterItems();
      }
    })

  }

  itemSelected(feed): void {
    alert(feed);
  }

  fetchContent(): void {

    let loading = this.loadingCtrl.create({
      content: 'Fetching content...'
    });

    loading.present();


    this.redditService.fetchData(this.url).then(data => {
      this.feeds = data;
      this.noFilter = this.feeds;
      loading.dismiss();
    });

  }


  doInfinite(infiniteScroll) {

    let paramsUrl = (this.feeds.length > 0) ? this.feeds[this.feeds.length - 1].data.name : "";

    this.http.get(this.olderPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {

        this.feeds = this.feeds.concat(data.data.children);

        this.feeds.forEach((e, i, a) => {
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1) {
            e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
          }
        })
        infiniteScroll.complete();
      });
  }


  showFilters(): void {

    this.content.scrollToTop();

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Filter options:',
      buttons: [
        {
          text: 'Music',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "newsbotbot");
            this.hasFilter = true;
          }
        },
        {
          text: 'Movies',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "dreads");
            this.hasFilter = true;
          }
        },
        {
          text: 'Games',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "gaming");
            this.hasFilter = true;
          }
        },
        {
          text: 'Pictures',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "TripleGmagazine");
            this.hasFilter = true;
          }
        },
        {
          text: 'Ask Reddit',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "askreddit");
            this.hasFilter = true;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.feeds = this.noFilter;
            this.hasFilter = false;
          }
        }
      ]
    });

    actionSheet.present();

  }

  filterItems() {
    this.hasFilter = false;
    this.feeds = this.noFilter.filter((item) => {
      return item.data.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }


}