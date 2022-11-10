import { Component, ElementRef, OnInit } from '@angular/core';
import { Empresa } from '../../models/empresa';
import { EmpresaService } from '../../services/empresa.service';
import {
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ModalDialogService } from '../../services/modal-dialog.service';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css'],
})
export class EmpresaComponent implements OnInit {
  Titulo = 'Empresa';
  TituloAccionABMC = {
    A: '(Agregar)',
    B: '(Eliminar)',
    M: '(Modificar)',
    C: '(Consultar)',
    L: '(Listado)',
  };
  AccionABMC = 'L'; // inicialmente inicia en el Listado de articulos (buscar con parametros)
  Mensajes = {
    SD: ' No se encontraron registros...',
    RD: ' Revisar los datos ingresados...',
  };

  Items: Empresa[] = null;
  RegistrosTotal: number;

  Pagina = 1; // inicia pagina 1

  // opciones del combo activo
  OpcionesActivo = [
    { Id: null, Nombre: '' },
    { Id: true, Nombre: 'SI' },
    { Id: false, Nombre: 'NO' },
  ];

  FormBusqueda = new FormGroup({
    RazonSocial: new FormControl(null),
    Activo: new FormControl(null),
  });

  FormRegistro = new FormGroup({
    IdEmpresa: new FormControl(0),
    RazonSocial: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    CantidadEmpleados: new FormControl(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(300),
    ]),
    FechaFundacion: new FormControl('', [
      Validators.required,
      Validators.pattern(
        '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
      ),
    ]),
    Activo: new FormControl(true),
  });

  submitted = false;

  constructor(
    //private articulosService: MockArticulosService,
    //private articulosFamiliasService: MockArticulosFamiliasService,
    private empresaService: EmpresaService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    // this.FormBusqueda = this.formBuilder.group({
    //   Nombre: [''],
    //   Activo: [null]
    // });
    // this.FormRegistro = this.formBuilder.group({
    //   IdArticulo: [0],
    //   Nombre: [
    //     '',
    //     [Validators.required, Validators.minLength(4), Validators.maxLength(55)]
    //   ],
    //   Precio: [null, [Validators.required, Validators.pattern('[0-9]{1,7}')]],
    //   Stock: [null, [Validators.required, Validators.pattern('[0-9]{1,7}')]],
    //   CodigoDeBarra: [
    //     '',
    //     [Validators.required, Validators.pattern('[0-9]{13}')]
    //   ],
    //   IdArticuloFamilia: ['', [Validators.required]],
    //   FechaAlta: [
    //     '',
    //     [
    //       Validators.required,
    //       Validators.pattern(
    //         '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
    //       )
    //     ]
    //   ],
    //   Activo: [true]
    // });

  }


  Agregar() {
    this.AccionABMC = 'A';
    this.FormRegistro.reset({ Activo: true, IdArticulo: 0 });
    this.submitted = false;
    //this.FormRegistro.markAsPristine();  // incluido en el reset
    //this.FormRegistro.markAsUntouched(); // incluido en el reset
  }

  // Buscar segun los filtros, establecidos en FormRegistro
  Buscar() {
    this.empresaService
      .get(
        this.FormBusqueda.value.RazonSocial,
        this.FormBusqueda.value.Activo,
        this.Pagina
      )
      .subscribe((res: any) => {
        this.Items = res.Items;
        this.RegistrosTotal = res.RegistrosTotal;
      });
  }

  // Obtengo un registro especifico según el Id
  BuscarPorId(Item, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.empresaService.getById(Item.IdEmpresa).subscribe((res: any) => {
      this.FormRegistro.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaFundacion.substr(0, 10).split('-');
      this.FormRegistro.controls.FechaFundacion.patchValue(
        arrFecha[2] + '/' + arrFecha[1] + '/' + arrFecha[0]
      );

      this.AccionABMC = AccionABMC;
    });
  }

  Consultar(Item) {
    this.BuscarPorId(Item, 'C');
  }

  // comienza la modificacion, luego la confirma con el metodo Grabar
  Modificar(Item) {
    if (!Item.Activo) {
      this.modalDialogService.Alert(
        'No puede modificarse un registro Inactivo.'
      );
      return;
    }
    this.submitted = false;
    this.FormRegistro.markAsUntouched();
    this.BuscarPorId(Item, 'M');
  }

  // grabar tanto altas como modificaciones
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormRegistro.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormRegistro.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.FechaFundacion.substr(0, 10).split('/');
    if (arrFecha.length == 3)
      itemCopy.FechaFundacion = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    // agregar post
    if (this.AccionABMC == 'A') {
      this.empresaService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
      });
    } else {
      // modificar put
      this.empresaService
        .put(itemCopy.IdEmpresa, itemCopy)
        .subscribe((res: any) => {
          this.Volver();
          this.modalDialogService.Alert('Registro modificado correctamente.');
          this.Buscar();
        });
    }
  }

  // representa la baja logica
  ActivarDesactivar(Item) {
    this.modalDialogService.Confirm(
      'Esta seguro de ' +
        (Item.Activo ? 'desactivar' : 'activar') +
        ' este registro?',
      undefined,
      undefined,
      undefined,
      () =>
        this.empresaService
          .delete(Item.IdEmpresa)
          .subscribe((res: any) => this.Buscar()),
      null
    );
  }

  // Volver/Cancelar desde Agregar/Modificar/Consultar
  Volver() {
    this.AccionABMC = 'L';
  }

  ImprimirListado() {
    this.modalDialogService.Alert('Sin desarrollar...');
  }

}
