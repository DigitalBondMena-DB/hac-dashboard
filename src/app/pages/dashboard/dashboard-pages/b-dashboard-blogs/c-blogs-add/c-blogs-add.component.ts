import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// PrimeNG Imports
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JoditAngularModule } from 'jodit-angular';
import 'jodit/esm/plugins/add-new-line/add-new-line.js';
import 'jodit/esm/plugins/bold/bold.js';
import 'jodit/esm/plugins/color/color.js';
import 'jodit/esm/plugins/copy-format/copy-format.js';
import 'jodit/esm/plugins/drag-and-drop/drag-and-drop.js';
import 'jodit/esm/plugins/fullsize/fullsize.js';
import 'jodit/esm/plugins/hotkeys/hotkeys.js';
import 'jodit/esm/plugins/iframe/iframe.js';
import 'jodit/esm/plugins/indent/indent.js';
import 'jodit/esm/plugins/justify/justify.js';
import 'jodit/esm/plugins/line-height/line-height.js';
import 'jodit/esm/plugins/preview/preview.js';
import 'jodit/esm/plugins/resizer/resizer.js';
import 'jodit/esm/plugins/search/search.js';
import 'jodit/esm/plugins/select/select.js';
import 'jodit/esm/plugins/source/source.js';
import 'jodit/esm/plugins/symbols/symbols.js';
import 'jodit/esm/plugins/video/video.js';

import { JoditConfig, NgxJoditComponent } from 'ngx-jodit';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';

import { Jodit } from 'jodit';
import { IUploader, IUploaderAnswer, IUploaderData } from 'jodit/types/types';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckPlatformService } from '../../../../../core/services/z-helpers/check-platform.service';
// import { BlogsService } from '../../../../../core/services/b-blogs/blogs.service';
import { IGetBlogById } from '../../../../../core/Interfaces/b-blogs/IGetBlogById';

@Component({
  selector: 'app-c-blogs-add',
  standalone: true,
  imports: [
    EditorModule,
    FileUploadModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    InputSwitchModule,
    ReactiveFormsModule,
    JoditAngularModule,
    FormsModule,
    NgxJoditComponent,
    ToastModule,
    DropdownModule,
    MultiSelectModule,
    CommonModule,
    CardModule,
    CalendarModule,
    DialogModule,
    NgxSpinnerModule,
    FloatLabelModule,
  ],
  templateUrl: './c-blogs-add.component.html',
  styleUrl: './c-blogs-add.component.scss',
  providers: [MessageService],
})
export class CBlogsAddComponent {
  
}
