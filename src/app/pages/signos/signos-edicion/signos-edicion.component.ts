import { PacienteDialogComponent } from './paciente-dialog/paciente-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Signos } from './../../../_model/signos';
import { PacienteService } from './../../../_service/paciente.service';
import { SignosService } from './../../../_service/signos.service';
import { Paciente } from './../../../_model/paciente';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {

  form: FormGroup;
  id: number;
  edicion: boolean;

  paciente: Paciente;

  pacientes: Paciente[];

  fechaSeleccionada: Date = new Date();

  maxFecha: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private signosService: SignosService,
    private router: Router,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'idPaciente' : new FormControl(),
      'fecha': new FormControl(new Date()),
      'temperatura': new FormControl('', [Validators.required]),
      'pulso': new FormControl('', [Validators.required]),
      'ritmo': new FormControl('', [Validators.required])
    });

    this.route.params.subscribe( (params: Params) => {
      this.id = params['id'];
      this.edicion = params['id'] != null;
      this.initForm();
    });

    this.pacienteService.pacienteCambio.subscribe(() => {
      this.listarPacientes();
    });

    this.listarPacientes();
  }

  get f() { return this.form.controls; }

  initForm(){
    if(this.edicion){
      this.signosService.listarPorId(this.id).subscribe(data => {
        this.form = new FormGroup({
          'id': new FormControl(data.idSignos),
          'idPaciente': new FormControl(data.paciente.idPaciente),
          'fecha': new FormControl(data.fecha),
          'temperatura': new FormControl(data.temperatura),
          'pulso': new FormControl(data.pulso),
          'ritmo': new FormControl(data.ritmo)
        });
      });
  }
}


  listarPacientes(){
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });

    this.pacienteService.mensajeCambio.subscribe(data => {
      this.snackBar.open(data, 'Aviso', {
        duration: 2000
      });
    });

  }

  abrirDialogo(){
    let paciente = new Paciente();
    this.dialog.open(PacienteDialogComponent, {
      width: '250px',
      data: paciente
    });
  }

  aceptar(){

    if (this.form.invalid) {
      return;
    }
    
    let paciente = new Paciente();
    paciente.idPaciente = this.form.value['idPaciente'];

    let signos = new Signos();

    signos.idSignos = this.form.value['id'];
    signos.paciente = paciente;
    signos.fecha = moment().format('YYYY-MM-DDTHH:mm:ss');
    signos.temperatura = this.form.value['temperatura'];
    signos.pulso = this.form.value['pulso'];
    signos.ritmo = this.form.value['ritmo'];

//    console.log(signos);

    if (this.edicion) {
      this.signosService.modificar(signos).pipe(switchMap(() => {
        return this.signosService.listar();
      })).subscribe(data => {
        this.signosService.signosCambio.next(data);
        this.signosService.mensajeCambio.next('SE MODIFICO');
      });
    } else {
      this.signosService.registrar(signos).pipe(switchMap(() => {
        return this.signosService.listar();
      })).subscribe(data => {
        this.signosService.signosCambio.next(data);
        this.signosService.mensajeCambio.next('SE REGISTRO');
      });
    }

    this.router.navigate(['signos-vitales']);

  }

}
