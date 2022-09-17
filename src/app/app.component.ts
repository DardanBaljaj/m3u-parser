import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { M3UReaderService } from 'src/service/m3u-reader.service';
import { Channel } from 'src/dto/Channel';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  channels: Channel[] = [];
  groups: String[] = [];
  uploaded: Boolean = false;
  loading: number = 0;
  fileUrl: any;

  constructor(
    private http: HttpClient,
    private M3UReader: M3UReaderService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {

    //   const PATH = './assets/aliexpress.m3u';

    //   this.http.get(PATH, { responseType: 'text'}).subscribe(data => {
    //     //console.log(data);
    //     this.reader.read(data);
    // })
  }


  public readFile(inputValue: any): void {

    this.uploaded = true;
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();


    myReader.onload = () => {
      this.channels = [];
      this.loadGroups();
      this.channels = this.M3UReader.read(myReader.result as string);
      this.loadGroups();
      this.loading = myReader.LOADING;
    }

    myReader.onloadend = () => {
      myReader.abort();
    }
    
    myReader.readAsText(file);
    
  }

  loadGroups(): void {
    this.groups = [...new Set(this.channels.map(obj => obj.header.group_title || ""))].sort();
  }

  public getChannelsByGroup(group_title: String): Channel[] {
    return this.channels.filter(channel => channel.header.group_title == group_title);
  }

  public delete(index: number | String, name: String) {
    if (typeof index == 'number') {
      this.channels = this.channels.filter(channel => channel.index !== index);
      // this.toastr.success("'" + name + "' has been deleted successfully!"); se cancelli tanti cannali poi non riesci a cliccare sul pulsante dai alert invasivi
    }
    else if (typeof index == 'string') {
      Swal.fire({
        title: 'Are you sure?',
        text: index,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.channels = this.channels.filter(group => group.header.group_title !== index);
          this.loadGroups();
          this.toastr.success("'" + name + "' has been deleted successfully!");
        }
      })
    }
  }

  countLength (group: String): number {
    return this.channels.filter(x => x.header.group_title == group).length;
  }

  edit(group: String) {
    Swal.fire({
      title: 'Enter your IP address',
      input: 'text',
      inputLabel: 'Your IP address',
      inputValue: group as string,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!'
        } else {
          return null;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.channels.forEach((channel) => {
          if (channel.header.group_title == group) {
            channel.header.group_title = result.value;
          }
        })
        this.loadGroups();
      }
    });



  }

  export(): void {
    const blob = new Blob(this.createOutput(), { type: 'audio/x-mpegurl' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  createOutput(): BlobPart[] {
    let blobpart: BlobPart[] = ["#EXTM3U\n"];
    this.channels.forEach(element => {
      blobpart.push(this.createOutputLine(
        element.header.extinf ? element.header.extinf : null,
        element.header.tvg_id ? "tvg-id=\"".concat(element.header.tvg_id, "\"") : null,
        element.header.tvg_name ? "tvg-name=\"".concat(element.header.tvg_name, "\"") : null,
        element.header.tvg_logo ? "tvg-logo=\"".concat(element.header.tvg_logo, "\"") : null,
        element.header.group_title ? "group-title=\"".concat(element.header.group_title, "\"") : null,
        element.header.name ? ", ".concat(element.header.name) : null
      ));
      element.other.forEach(x => blobpart.push(this.createOutputLine(x)));
    });

    return blobpart;
  }

  createOutputLine(...args: (string | null)[]): BlobPart {
    let line = "";
    args.forEach(element => {
      if (element != null) {
        line += (element + " ");
      }
    });

    line = line.replace(/\s*,\s*/g, ", ");

    return line.replace(/.$/, "\n");
  }


}
