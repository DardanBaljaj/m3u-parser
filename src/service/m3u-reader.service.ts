import { Injectable } from '@angular/core';
import { Channel } from 'src/dto/Channel';

@Injectable({
  providedIn: 'root'
})
export class M3UReaderService {
  constructor() { }
  private channels: Channel[] = [];
  

  private EXTINF_REGEX = "#EXTINF: -1";
  private TVG_ID_REGEX = 'tvg-id="';
  private TVG_NAME_REGEX = 'tvg-name="';
  private TVG_LOGO_REGEX = 'tvg-logo="';
  private TVG_SHIFT_REGEX = "tvg-shift=\"";
  private GROUP_TITLE_REGEX = 'group-title="';
  private RADIO_REGEX = "radio=\"";

  read(filetext:string): Channel[] {
    // svuoto
    this.channels = [];
    
    // RIMUOVO la PRIMA RIGA (contenente #EXTM3U)
    filetext = filetext.substring(filetext.indexOf('\n')+1);

    // PARSO il file riga per riga
    for (const line of filetext.split(/[\r\n]+/)){
      const index = this.channels.length - 1;

      if (line.includes("#EXTINF:")){ // Se la riga include #EXTINF:
        this.channels.push({
          index: this.channels.length,
          header: {
            extinf: this.EXTINF_REGEX,
            tvg_id: this.getValueOfParametersFromLine(line, this.TVG_ID_REGEX),
            tvg_name: this.getValueOfParametersFromLine(line, this.TVG_NAME_REGEX),
            tvg_logo: this.getValueOfParametersFromLine(line, this.TVG_LOGO_REGEX),
            group_title: this.getValueOfParametersFromLine(line, this.GROUP_TITLE_REGEX),
            name: line.substring(line.lastIndexOf("\", ") + 3)
          }, 
          other : []
        });
      }else{ // Se la riga NON include #EXTINF:
        this.channels[index].other.push(line);
      }
    }
    return this.channels;
  }

  private checkStart(line: string): Boolean {
    if (line != "#EXTM3U"){
      return false;
    }else{
      return true;
    }
  }

  private getValueOfParametersFromLine(line: string, paramater: string){
    if (!line.includes(paramater)) {
      return null;
    }
    const temp_line = line.substring(line.indexOf(paramater) + paramater.length);
    return temp_line.substring(0, temp_line.indexOf('"'));
  }
}
