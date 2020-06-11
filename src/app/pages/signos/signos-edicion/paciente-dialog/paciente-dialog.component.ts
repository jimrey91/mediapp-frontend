import { switchMap } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PacienteService } from './../../../../_service/paciente.service';
import { Paciente } from './../../../../_model/paciente';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-paciente-dialog',
  templateUrl: './paciente-dialog.component.html',
  styleUrls: ['./paciente-dialog.component.css']
})
export class PacienteDialogComponent implements OnInit {

  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  direccion: string;

  constructor(
    private pacienteService: PacienteService,
    private dialogRef: MatDialogRef<PacienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data : Paciente
  ) { }

  ngOnInit(): void {
  }

  agregar(){

    let paciente = new Paciente();
    paciente.nombres = this.nombres;
    paciente.apellidos = this.apellidos;
    paciente.dni = this.dni;
    paciente.telefono = this.telefono;
    paciente.direccion = this.direccion;


/*     this.pacienteService.registrar(paciente).subscribe(() => {
      this.pacienteService.mensajeCambio.next('SE REGISTRO');
    }); */
    this.pacienteService.registrar(paciente).pipe(switchMap( () => {
      return this.pacienteService.listar();
    })).subscribe(data => {
      this.pacienteService.mensajeCambio.next('SE REGISTRO');
      this.pacienteService.pacienteCambio.next(data);
    });

    this.dialogRef.close();
  }

  cancelar(){
    this.dialogRef.close();
  }

}
