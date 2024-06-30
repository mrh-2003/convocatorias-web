import { Component, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ContratacionService } from '../../services/contratacion.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { MenubarModule } from 'primeng/menubar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConvocadoService } from '../../services/convocado.service';
import { Contratacion } from '../../models/contratacion';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UppercaseDirective } from '../../directives/uppercase.directive';
@Component({
  selector: 'app-listar-convocatorias',
  standalone: true,
  imports: [DialogModule, MenubarModule, InputTextModule, CommonModule, FormsModule, TableModule, ButtonModule,
    TagModule, DropdownModule, RouterModule, FileUploadModule, UppercaseDirective,
    NgxExtendedPdfViewerModule, ToastModule, ReactiveFormsModule, ProgressSpinnerModule],
  templateUrl: './listar-convocatorias.component.html',
  styleUrl: './listar-convocatorias.component.css',
  providers: [MessageService]
})
export class ListarConvocatoriasComponent {
  visible = false;
  form!: FormGroup;
  tipoServicios!: any[];
  contrataciones!: any[];
  tipoSede!: any[];
  pdfUrl = '';
  isPDF = false;
  estados !: any[];
  loading: boolean = true;
  file !: File | null;
  codigoContratacion = 0;
  progress = false;
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  constructor(private contratacionService: ContratacionService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private convocadoService: ConvocadoService,
    private primengConfig: PrimeNGConfig
  ) { }
  ngOnInit() {
    this.form = this.formBuilder.group({
      dniRuc: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]],
      nombre: ['', [Validators.required]],
      apellidoPaterno: ['', [Validators.required]],
      apellidoMaterno: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      urlPDF: [''],
      estado: [''],
      codigoContratacion: [0]
    });
    this.loading = true;
    this.contratacionService.getContrataciones().subscribe((contrataciones) => {
      this.contrataciones = contrataciones;
      this.loading = false;
    });
    this.tipoServicios = [
      { label: 'Bien', value: 'Bien' },
      { label: 'Servicio', value: 'Servicio' }
    ];
    this.estados = [
      { label: 'Activo', value: 'Activo' },
      { label: 'Finalizado', value: 'Finalizado' }
    ];
    this.tipoSede = [
      { label: 'Central', value: 'Central' },
      { label: 'Dirección Zonal', value: 'Dirección Zonal' }
    ];
    this.primengConfig.setTranslation({
      clear: 'Limpiar',
      apply: 'Aplicar',
    });
  }
  noVencido(contratacion: Contratacion) {
    return contratacion.fechaVencimiento >= new Date().toISOString().split('T')[0];
  }
  clear(table: Table, textInput: HTMLInputElement) {
    table.clear();
    textInput.value = '';
    this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Tabla limpiada' });
  }
  validateNumberInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  verFormulario(codigo: number) {
    this.visible = true;
    this.form.reset();
    this.file = null;
    this.fileUpload.clear();
    this.codigoContratacion = codigo;
  }

  getSeverity(estado: string) {
    return estado == 'Activo' ? 'success' : 'danger';
  }
  verPdf(url: string) {
    if (url.toLowerCase().endsWith('.pdf')) {
      this.pdfUrl = url;
      this.isPDF = true;
    } else {
      window.open(url, '_blank');
    }
  }
  onSelect(event: FileUploadHandlerEvent) {
    this.file = event.files[0];
  }
  onSubmit() {
    if (this.form.valid && this.file) {
      this.convocadoService.existDNI(this.form.value.dniRuc, this.codigoContratacion).subscribe((exists) => {
        if (exists) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ya existe un postulante con ese DNI en esta convocatoria' });
          return;
        } else {
          this.visible = false;
          this.progress = true;
          let uniqueFileName = `${new Date().getTime()}_${this.file!.name}`;
          let formData = new FormData();
          formData.append('file', this.file!, uniqueFileName);
          this.convocadoService.addConvocadoDocument(formData).subscribe((response: any) => {
            this.form.value.urlPDF = response['url'];
            this.form.value.codigoContratacion = this.codigoContratacion;
            this.convocadoService.createConvocado(this.form.value).subscribe(() => {
              this.form.reset();
              this.fileUpload.clear();
              this.progress = false;
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Datos guardados correctamente' });
            });
          });
        }
      });
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ingrese todos los campos' });
    }
  }
}
