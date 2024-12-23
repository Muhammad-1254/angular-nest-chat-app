import { Injectable } from '@angular/core';
import { fromEvent, map, merge, mergeMap, of, race, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaService {
  getMediaMetaData(url: string) {
    return of(url).pipe(
      mergeMap((path) => {
        const img = new Image();
        let load = fromEvent(img, 'load').pipe(map((_) => img));
        let error = fromEvent(img, 'error').pipe(
          mergeMap((err) => throwError(() => err))
        );
        img.src = path;
        return race(load, error);
      })
    );
  }
}
