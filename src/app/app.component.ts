import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImageService } from './services/image-service.service';
import { Subscription, forkJoin, map } from 'rxjs';
import { PcaParameters, LatentEdit } from './models/PcaParameters';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy{
  title = 'CapstoneProjectFE';

  latentEdits: Array<LatentEdit> = Array();
  principalComponent: string = "";
  imgUrl: SafeUrl = "";
  pcaUrl: SafeUrl = "";
  imgSubscription: Subscription = new Subscription();
  pcaSubscription: Subscription = new Subscription();
  imagesArray: any[] = []
  selectedImage: any

  currentLatentEdit: LatentEdit;

  addLatentEdit(): void {
    this.latentEdits.push({
      principal_component_number: this.currentLatentEdit.principal_component_number,
      start_layer: this.currentLatentEdit.start_layer,
      end_layer: this.currentLatentEdit.end_layer,
      lower_coeff_limit: this.currentLatentEdit.lower_coeff_limit,
      upper_coeff_limit: this.currentLatentEdit.upper_coeff_limit
    });
  }


  deleteLatentEdit( index: number ): void{
    if( index >= 0 && index <= this.latentEdits.length )
      this.latentEdits.splice(index, 1);
  }

  /*getImage() {
    this.imgSubscription = this.imageService.getImage("4c0bc809cb296c1f.png").subscribe(response => {
        const file = new Blob([response], { type: 'image/jpeg' });
        const fileURL = URL.createObjectURL(file);
        const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(fileURL);

        this.imgUrl = sanitizedURL;
    });
  }*/

  runPCA(): void{
    let params: PcaParameters = {
      vector_id : this.selectedImage.id + '.pkl',
      latent_edits: this.latentEdits
    };
    
    this.pcaSubscription = this.imageService.runPca(params).subscribe(response => {
      this.imageService.getPCA(this.selectedImage.id as string).subscribe(response => {
        const file = new Blob([response], { type: 'image/jpeg' });
        const fileURL = URL.createObjectURL(file);
        const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(fileURL);

        this.pcaUrl = sanitizedURL;
      })
      
    })
  }

  selectImage( image: any ){
    this.selectedImage = image;
    this.imageService.getPCA(this.selectedImage.id as string).subscribe(response => {
      const file = new Blob([response], { type: 'image/jpeg' });
      const fileURL = URL.createObjectURL(file);
      const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(fileURL);

      this.pcaUrl = sanitizedURL;
    }, error => {
      this.pcaUrl = "";
      console.log("error", error);
    });
  }

  /**
   *
   */
  constructor( private imageService: ImageService, private sanitizer: DomSanitizer ) {
    this.currentLatentEdit = {
      start_layer: 0,
      end_layer: 0,
      lower_coeff_limit: 0,
      principal_component_number: 0,
      upper_coeff_limit: 0
    }
  }
  ngOnDestroy(): void {
    this.imgSubscription.unsubscribe();
  }

  getImagesObject( imagesIds: string[] ){
    let imageObservables = [];
    for (const id of imagesIds) {
      const observable = this.imageService.getImage(id);
      imageObservables.push(observable);
    }
    
    forkJoin(imageObservables)
      .pipe(
        map( (image: any) => {
          return image;
        })
      )
      .subscribe(data => {
        for( let key in data){
          const file = data[key].image;
          const fileURL = URL.createObjectURL(file);
          const sanitizedURL = this.sanitizer.bypassSecurityTrustUrl(fileURL);
          data[key].url = sanitizedURL;
          this.imagesArray.push(data[key]);
        }
        
        if( this.imagesArray.length > 0 )
          this.selectImage(this.imagesArray[0]);
      });
  }

  ngOnInit(): void {

    this.imageService.getImagesIds().subscribe(response => {
      this.getImagesObject(response);
    });
  }

}




