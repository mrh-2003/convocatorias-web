import { Component } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConvocadoService } from '../../services/convocado.service';
import { Contratacion } from '../../models/contratacion';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-listar-convocatorias',
  standalone: true,
  imports: [DialogModule, MenubarModule, InputTextModule, CommonModule, FormsModule, TableModule, ButtonModule,
    TagModule, DropdownModule, RouterModule, FileUploadModule,
    NgxExtendedPdfViewerModule, ToastModule, ReactiveFormsModule],
  templateUrl: './listar-convocatorias.component.html',
  styleUrl: './listar-convocatorias.component.css',
  providers: [MessageService] 
})
export class ListarConvocatoriasComponent {
  visible = false;
  form!: FormGroup;
  tipoServicios!: any[];
  contrataciones!: any[];
  pdfUrl = '';
  isPDF = false;
  estados !: any[];
  loading: boolean = true;
  file !: File;
  mensaje = '';
  codigoContratacion = 0;
   constructor(private contratacionService: ContratacionService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private convocadoService: ConvocadoService
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
      estado: [true],
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
      { label: 'Inactivo', value: 'Inactivo' }
    ];
  }
  noVencido(contratacion: Contratacion) {
    return contratacion.fechaVencimiento >= new Date().toISOString().split('T')[0];
  }
  clear(table: Table, textInput: HTMLInputElement) {
    table.clear();
    textInput.value = '';
    this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Tabla limpiada' });
  }

  verFormulario(codigo: number){
    this.visible = true;
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
    this.mensaje = ` ${this.file.name} - ${this.file.size / 1024} KB`;
  }
  onSubmit(){
    if(this.form.valid && this.file){
      let uniqueFileName = `${new Date().getTime()}_${this.file.name}`;
      let formData = new FormData();
      formData.append('file', this.file, uniqueFileName);
      this.convocadoService.addConvocadoDocument(formData).subscribe((response: any) => {
        this.form.value.urlPDF = response['url'];
        this.form.value.codigoContratacion = this.codigoContratacion;
        this.convocadoService.createConvocado(this.form.value).subscribe(() => {
          this.visible = false;
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Datos guardados correctamente' });
        });
      });
    }
    else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ingrese todos los campos' });
    }
  } 
}
