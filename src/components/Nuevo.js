import React, { Component } from "react";
import Loading from "../utils/loading";
import { Link } from "react-router-dom";
import { Redirect } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Alert,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Breadcrumb,
  BreadcrumbItem,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import classnames from "classnames";

import ModalMsg from "../utils/ModalMsg";

const Alerta = (props) => {
  return <Alert color="danger">No se encontro el registro!</Alert>;
};

const Marca = (props) => {
  return (
    <img
      src={`${process.env.REACT_APP_URL_API_SERVER_2}/imgs/googlemark.png`}
      style={{ width: "32px", height: "32px" }}
      alt="I"
    />
  );
};

const format_date = (fecha) => {
  if (fecha) {
    // YYYY-mm-dd
    let farray = fecha.split("-");
    // dd/mm/YYYY
    return `${farray[2]}/${farray[1]}/${farray[0]}`;
  } else {
    return null;
  }
};

class Nuevo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      modal: {
        nuevo: true,
        msg: "",
        extras: "",
        open: false,
        onlyOk: true,
      },
      id: 0,
      tipos: [{ id: 0, descripcion: "Loading..." }],
      guia: {
        galeria: [], //wtf??
      },
      departamentos: [],
      ciudades: [],
      ultimo: 1,
      tiposcategorias: [{ id: 0, descripcion: "Loading..." }],
      tiposcategoriasselect: 0,
      valorestipocat: [{ valor: 0, descripcion: "Loading..." }],
      valorestipocatselect: 0,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDepartamentoChange = this.handleDepartamentoChange.bind(this);
    this.handleTipoCategorias = this.handleTipoCategorias.bind(this);
    this.handleValorTipoCatSelect = this.handleValorTipoCatSelect.bind(this);
    this.findValorizacion = this.findValorizacion.bind(this);
    this.getCiudades = this.getCiudades.bind(this);
    this.readURLLogo = this.readURLLogo.bind(this);
    this.handleMsgOk = this.handleMsgOk.bind(this);
    this.toggleTabs = this.toggleTabs.bind(this);
    this.subirFormulario = this.subirFormulario.bind(this);
  }

  /*
	this.handleKeyUp = this.handleKeyUp.bind(this);
	<form onKeyUp={this.handleKeyUp}>
	handleKeyUp(event) {
		if (event.keyCode == 13) return this.sendData()
	}
	*/

  toggleTabs(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }

  handleMsgOk = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        open: false,
      },
    });
    this.props.history.push(this.props.match.url);
    //window.location.reload(true);
  };

  findValorizacion = (idTipoCategoriasSelect, idValorTipCatGuia) => {
    fetch(
      process.env.REACT_APP_URL_API_SERVER_2 +
        "/valorizaciones/tipo/" +
        idTipoCategoriasSelect
    ).then((res) => {
      if (res.ok && res.status === 200) {
        res.json().then((data) => {
          this.setState(
            {
              valorestipocat: data.data.registros,
            },
            () => {
              if (idValorTipCatGuia === 0) {
                this.setState({
                  valorestipocatselect: this.state.valorestipocat[0].id,
                });
              } else {
                this.setState({ valorestipocatselect: idValorTipCatGuia });
              }
            }
          );
        });
      }
    });
  };

  handleValorTipoCatSelect = (event) => {
    this.setState({
      guia: {
        ...this.state.guia,
        idvalortipcat: event.target.value,
      },
      valorestipocatselect: event.target.value,
    });
  };

  handleTipoCategorias = (event) => {
    this.setState({
      guia: {
        ...this.state.guia,
        idtipocategorias: event.target.value,
      },
      tiposcategoriasselect: event.target.value,
    });
    this.findValorizacion(event.target.value, 0);
  };

  getCiudades = (idDepartamento) => {
    return fetch(
      process.env.REACT_APP_URL_API_SERVER_2 +
        "/ciudades/departamento/" +
        idDepartamento
    ).then((res) => {
      if (res.ok && res.status === 200) {
        res.json().then((data) => {
          this.setState({
            ciudades: data.data.registros,
          });
        });
      }
    });
  };

  readURLLogo = (event) => {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        document
          .getElementById("logopreview")
          .setAttribute("src", e.target.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  handleDepartamentoChange = (event) => {
    const value = event.target.value;
    this.setState(
      (prevState) => ({
        guia: {
          ...prevState.guia,
          iddepartamento: value,
        },
      }),
      () => {
        this.getCiudades(value).then(() => {
          const idCity = this.state.ciudades;
          //console.log(this.state.ciudades[0] + "id ?? ");
          this.setState((prevState) => ({
            guia: {
              ...prevState.guia,
            },
          }));
        });
      }
    );
  };
  subirFormulario = (event) => {
    this.setState({ loading: true });
    event.preventDefault();
    var data = new FormData();
    data.append("data", event.target);
    for (var [key, value] of Object.entries(this.state.guia)) {
      data.append(key, value);
    }
    //Se pasa el ID del Usuario actual
    if ("WebTurId" in localStorage) {
      //Siempre debería existir!
      if (localStorage.getItem("WebTurId").length > 0) {
        data.set("iduser", localStorage.getItem("WebTurId"));
      }
    }
    var logo = document.getElementById("uploadLogo").files[0];
    if (logo) {
      data.append("logo", logo, logo.name);
    }
    fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("WebTurToken"),
        //"Content-Type": "multipart/form-data"
      },
      body: data,
    }).then((res) => {
      this.setState({ loading: false });
      if (res.ok && res.status === 200) {
        res.json().then((data) => {
          if (data.logo !== this.state.guia.logo) {
            this.setState({
              guia: {
                ...this.state.guia,
                logo: data.logo,
              },
            });
          }
        });
        //this.state.guia.logo
        this.setState({
          modal: {
            ...this.state.modal,
            msg: "Los datos se actualizaron correctamente!",
            open: true,
            nuevo:true,
          },
        });

        //<Redirect to={this.state.ultimo}></Redirect>
      } else {
        //409 Conflicto
        res.json().then((data) => {
          if (data.err === true) {
            let errores = "";
            if (data.errMsgs && Array.isArray(data.errMsgs)) {
              data.errMsgs.forEach((element) => {
                errores += `<p>${element}</p>`;
              });
            }
            this.setState({
              modal: {
                ...this.state.modal,
                msg: data.errMsg,
                extras: errores,
                open: true,
              },
            });
          } else {
            //Error desconocido OJO!
            this.setState({
              modal: {
                ...this.state.modal,
                msg:
                  "Error desconocido, comunicar al Administrador del sistema esta situación!",
                open: true,
              },
            });
          }
        });
      }
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
  };

 /* handleChange = (event) => {
    const target = event.target;
    const name = target.name;
    //const value = target.type === "checkbox" ? target.checked : target.value;
    var value = target.type === "checkbox" ? target.checked : target.value;
    if (target.type === "number") {
      if (value === "") {
        value = 0;
      } else {
        if (isFinite(value)) {
          let x = parseInt(value, 10);
          if (x < 0 || x > 999) {
            x = 0;
          }
          value = x; //Por algun motivo queda un 0 ver!
        } else {
          value = 0;
        }
      }
    }
*/

    //---------------------------------------
    handleChange = (event) => {
      const target = event.target;
      const name = target.name;
      //const value = target.type === "checkbox" ? target.checked : target.value;
      var value = target.type === "checkbox" ? target.checked : target.value ;
      var valueInt = Number(value);
    
      if (target.type === "number") {
        if (valueInt === "") {
          valueInt = 1;
          
        } else {
          if (isFinite(valueInt)) {
            let x = parseInt(valueInt, 10);
            if (x > 0 || x < 999) {
              x = 0;
            }
            valueInt = x; //Por algun motivo queda un 0 ver!
          } else {
            valueInt = 0;
          }
        }
      }
   // console.log(name + " " +  value);
//    console.log(name + " " + valueInt);
    //--------------------------------
    

    this.setState({
      guia: {
        ...this.state.guia,
        [name]: value,
      },
    });
  };

//---------------------------------
handleAdhiereChange = (event) => {
  const target = event.target;
  const name = target.name;
   var value = Number(target.type === "checkbox" ? target.checked : target.value) ;
  this.setState({  guia: {
    ...this.state.guia,
    [name]: value,
  },
    });
  
};
//---------------------------------


  componentDidMount() {
     fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/guia/ultimo").then(
      (res) => {
        if (res.ok && res.status === 200) {
          res.json().then((data) => {
            this.setState({
              ultimo: data.data.registros[0].id,
            });
            console.log(this.state.ultimo);
           
          });
        }
        
      }
    ); 
    if (true) {
      //Tipos de Categorias
      fetch(
        process.env.REACT_APP_URL_API_SERVER_2 + "/valorizaciones/tipos"
      ).then((res) => {
        if (res.ok && res.status === 200) {
          res.json().then((data) => {
            this.setState({
              tiposcategorias: data.data.registros,
            });
          });
        }
      });
      //Tipos de Alojamiento
      fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/tipos").then((res) => {
        if (res.ok && res.status === 200) {
          res.json().then((data) => {
            this.setState({
              tipos: data.data.registros,
            });
          });
        }
      });
      
      this.setState({
        guia: {
          iddepartamento: 1,
          idciudad: 1,
          idtipo: 1,
          idvalortipcat: 1,
          nombre: "",
          legajo: "",
          cuit:"",
          domicilio: "",
          telefono: "",
          habitaciones: 0,
          camas: 0,
          plazas: 0,
          mail: "",
          web: "",
          latitud: 0,
          longitud: 0,
          descripcion: "",
          logo: "default.jpg",
          notas: "",
          lupdate: "",
          iduser: 1,
          activo: 1,
          p_nombre: "",
          p_telefono: "",
          p_mail: "",
          p_domicilio: "",
          p_dni: "",
          r_nombre: "",
          r_telefono: "",
          r_mail: "",
          r_domicilio: "",
          r_dni: "",
          r_cargo: "",
          r_vencimiento: "",
          epoca: "",
          estado: "",
          adhiereCovid: 0,
          adhiereVoucher: 0,
          adhiereDosep: 0
        },
      });
      fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/departamentos").then(
        (res) => {
          if (res.ok && res.status === 200) {
            res.json().then((data) => {
              this.setState(
                {
                  departamentos: data.data.registros,
                },
                () => {
                  this.getCiudades(this.state.guia.iddepartamento);
                  this.setState({ loading: false });
                }
              );
            });
          }
        }
      );
      this.setState({ loading: false });
      this.toggleTabs("1");
    } else {
      this.setState({
        loading: false,
        error: true,
      });
    }
  }

  render() {
    const loading = this.state.loading;
    const error = this.state.error;
    const tipos = this.state.tipos.map((t) => {
      return (
        <option key={"t-" + t.id} value={t.id}>
          {t.descripcion}
        </option>
      );
    });
    const departamentos = this.state.departamentos.map((d) => {
      return (
        <option key={"d-" + d.id} value={d.id}>
          {d.nombre}
        </option>
      );
    });
    const ciudades = this.state.ciudades.map((c) => {
      return (
        <option key={"c-" + c.id} value={c.id}>
          {c.nombre}
        </option>
      );
    });
    const center = {
      lat: parseFloat(this.state.guia.latitud),
      lng: parseFloat(this.state.guia.longitud),
    };
    const titulo = this.state.guia.nombre;
    const categorias = this.state.tiposcategorias.map((tc) => {
      return (
        <option key={"tc-" + tc.id} value={tc.id}>
          {tc.descripcion}
        </option>
      );
    });
    const valorestipocat = this.state.valorestipocat.map((vtc) => {
      return (
        <option key={"vtc-" + vtc.id} value={vtc.id}>
          {vtc.descripcion}
        </option>
      );
    });
    let dataTabs = [
      //Fiscalización
      { nombre: "Nuevo Establecimiento", id: "1" },
    ];
    /*
		let dataTabs = [
			//Fiscalización
			{nombre: "Establecimiento", id: "1"},
			{nombre: "Propietario", id: "8"},
			{nombre: "Responsable", id: "9"},
			{nombre: "Notas", id: "10"},
			{nombre: "Servicios", id: "4"},
			{nombre: "Redes", id: "5"},
			{nombre: "Tarifas", id: "7"}
		];
		if("WebTurIdTipo" in localStorage) {
			if(localStorage.getItem("WebTurIdTipo") === "2") { //Si es una admin Web
				//Web
				dataTabs.push({nombre: "Descripción", id: "2"});
				dataTabs.push({nombre: "Geo", id: "3"});
				dataTabs.push({nombre: "Imágenes", id: "6"});
			}
		}
		*/
    const Tabs = dataTabs.map((dT) => {
      return (
        <NavItem key={`dT-${dT.id}`}>
          <NavLink
            className={classnames({ active: this.state.activeTab === dT.id })}
            onClick={() => {
              this.toggleTabs(dT.id);
            }}
          >
            {dT.nombre}
          </NavLink>
        </NavItem>
      );
    });
    return (
      <Container>
        <Row>
          <Col xs="12" md="6">
            <div className="d-flex align-items-baseline">
              <Button
                style={{ marginBottom: "10px" }}
                color="primary"
                className="mr-2 btn-lg"
                onClick={(e) => this.props.history.push("/")}
              >
                <i className="fas fa-arrow-circle-left" />
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            {loading ? (
              <Loading />
            ) : error ? (
              <Alerta />
            ) : (
              <div className="col justify-content-center mb-4 rounded shadow bg-white pt-4">
                <div className="mb-4 bg-dark p-4 text-white">
                  <a
                    href={`${process.env.REACT_APP_URL_API_SERVER_2}/detalle/${this.state.guia.id}`}
                    target="_blank"
                  >
                    {this.state.guia.legajo}
                  </a>{" "}
                  <i className="fas fa-arrow-right" /> {this.state.guia.nombre}
                </div>
                <Form
                  onSubmit={this.handleSubmit}
                  className="pb-5"
                  autoComplete="off"
                >
                  <Nav tabs className="mb-4">
                    {Tabs}
                  </Nav>
                  <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                      <Row>
                        <Col
                          xs="12"
                          md="4"
                          style={{ textAlign: "center", marginBottom: "16px" }}
                        >
                          <img
                            id="logopreview"
                            src={`${process.env.REACT_APP_URL_API_SERVER_2}/logos/${this.state.guia.logo}`}
                            className="img-fluid img-thumbnail"
                            style={{ maxHeight: "230px" }}
                            alt="Logo"
                            onClick={() => {
                              document.getElementById("uploadLogo").click();
                            }}
                          />
                          <Input
                            id="uploadLogo"
                            name="uploadLogo"
                            type="file"
                            className="d-none"
                            accept="image/*"
                            onChange={this.readURLLogo}
                          />
                          <Input
                            id="id"
                            name="id"
                            type="text"
                            className="d-none"
                            value={this.state.guia.id}
                            readOnly={true}
                          />
                          <Input
                            id="logo"
                            name="logo"
                            type="text"
                            className="d-none"
                            value={this.state.guia.logo}
                            readOnly={true}
                          />
                        </Col>
                        <Col xs="12" md="8">
                          <Row>
                            <Col xs="12" md="6">
                              <FormGroup>
                                <Label htmlFor="departamento">
                                  Departamento
                                </Label>
                                <Input
                                  type="select"
                                  className="form-control"
                                  id="departamento"
                                  name="departamento"
                                  value={this.state.guia.iddepartamento}
                                  onChange={this.handleDepartamentoChange}
                                >
                                  {departamentos}
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col xs="12" md="6">
                              <FormGroup>
                                <Label htmlFor="idciudad">Ciudad</Label>
                                <Input
                                  type="select"
                                  className="form-control"
                                  id="idciudad"
                                  name="idciudad"
                                  value={this.state.guia.idciudad}
                                  onChange={this.handleChange}
                                >
                                  {ciudades}
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs="12" md="6">
                              <FormGroup>
                                <Label htmlFor="legajo">Legajo</Label>
                                <Input
                                  type="text"
                                  className="form-control"
                                  id="legajo"
                                  name="legajo"
                                  placeholder="Número de legajo"
                                  value={this.state.guia.legajo}
                                  onChange={this.handleChange}
                                  maxLength="5"
                                />
                              </FormGroup>
                            </Col>
                            <Col xs="12" md="6">
                              <FormGroup>
                                <Label htmlFor="idtipo">Tipo</Label>
                                <Input
                                  type="select"
                                  className="form-control"
                                  id="idtipo"
                                  name="idtipo"
                                  value={this.state.guia.idtipo}
                                  onChange={this.handleChange}
                                >
                                  {tipos}
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs="12" md="6">
                              <FormGroup>
                                <Label htmlFor="tipocategorias">
                                  Tipo Categoría
                                </Label>
                                <Input
                                  type="select"
                                  className="form-control"
                                  id="tipocategorias"
                                  name="tipocategorias"
                                  value={this.state.tiposcategoriasselect}
                                  onChange={this.handleTipoCategorias}
                                >
                                  {categorias}
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col xs="12" md="6">
                              <FormGroup>
                                <Label htmlFor="idvalortipcat">Categoría</Label>
                                <Input
                                  type="select"
                                  className="form-control"
                                  id="idvalortipcat"
                                  name="idvalortipcat"
                                  value={this.state.valorestipocatselect}
                                  onChange={this.handleValorTipoCatSelect}
                                >
                                  {valorestipocat}
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="12" md="4">
                          <FormGroup>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="nombre"
                              name="nombre"
                              placeholder=""
                              value={this.state.guia.nombre}
                              onChange={this.handleChange}
                              maxLength="100"
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="4">
                          <FormGroup>
                            <Label htmlFor="domicilio">Domicilio</Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="domicilio"
                              name="domicilio"
                              placeholder=""
                              value={this.state.guia.domicilio}
                              onChange={this.handleChange}
                              maxLength="100"
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="4">
                          <FormGroup>
                            <Label htmlFor="cuit">Cuit</Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="cuit"
                              name="cuit"
                              placeholder=""
                              value={this.state.guia.cuit}
                              onChange={this.handleChange}
                              maxLength="20"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                      <Col xs="12" md="3">
                          <FormGroup>
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                              type="text"
                              className="form-control"
                              id="telefono"
                              name="telefono"
                              placeholder=""
                              value={this.state.guia.telefono}
                              onChange={this.handleChange}
                              maxLength="20"
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="3">
                          <FormGroup>
                            <Label htmlFor="habitaciones">Habitaciones</Label>
                            <Input
                              type="number"
                              className="form-control"
                              id="habitaciones"
                              name="habitaciones"
                              placeholder=""
                              value={this.state.guia.habitaciones}
                              onChange={this.handleChange}
                              min="0"
                              max="999"
                              style={{ textAlign: "right" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="3">
                          <FormGroup>
                            <Label htmlFor="plazas">Plazas</Label>
                            <Input
                              type="number"
                              className="form-control"
                              id="plazas"
                              name="plazas"
                              placeholder=""
                              value={this.state.guia.plazas}
                              onChange={this.handleChange}
                              min="0"
                              max="999"
                              style={{ textAlign: "right" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="3">
                          <FormGroup>
                            <Label htmlFor="camas">Camas</Label>
                            <Input
                              type="number"
                              className="form-control"
                              id="camas"
                              name="camas"
                              placeholder=""
                              value={this.state.guia.camas}
                              onChange={this.handleChange}
                              min="0"
                              max="999"
                              style={{ textAlign: "right" }}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="12" md="6">
                          <FormGroup>
                            <Label htmlFor="mail">EMail</Label>
                            <Input
                              type="email"
                              className="form-control"
                              id="mail"
                              name="mail"
                              placeholder=""
                              value={this.state.guia.mail}
                              onChange={this.handleChange}
                              maxLength="150"
                            />
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="6">
                          <FormGroup>
                            <Label htmlFor="web">Página Web</Label>
                            <div className="input-group">
                              <Input
                                type="text"
                                className="form-control"
                                id="web"
                                name="web"
                                placeholder=""
                                value={this.state.guia.web}
                                onChange={this.handleChange}
                                maxLength="150"
                              />
                              <div className="input-group-append">
                                <span
                                  className="input-group-text"
                                  id="inputGroupPrepend"
                                >
                                  <a
                                    href={`http://${this.state.guia.web}`}
                                    target="_blank"
                                  >
                                    <i className="fas fa-link" />
                                  </a>
                                </span>
                              </div>
                            </div>
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="12">
                          <FormGroup>
                            <Label htmlFor="epoca">
                              Época de Prestación de Servicios
                            </Label>
                            <div className="input-group">
                              <Input
                                type="text"
                                className="form-control"
                                id="epoca"
                                name="epoca"
                                placeholder=""
                                value={this.state.guia.epoca}
                                onChange={this.handleChange}
                                maxLength="200"
                              />
                            </div>
                          </FormGroup>
                        </Col>
                        <Col xs="12" md="12">
                          <FormGroup>
                            <Label htmlFor="estado">
                              Estado de Fiscalización
                            </Label>
                            <div className="input-group">
                              <Input
                                type="text"
                                className="form-control"
                                id="estado"
                                name="estado"
                                placeholder=""
                                value={this.state.guia.estado}
                                onChange={this.handleChange}
                                maxLength="200"
                              />
                            </div>
                          </FormGroup>
                        </Col>


                        <Col xs="12" md="12">
                        <FormGroup check>
                            <Input 
                            type="checkbox"
                            name="adhiereCovid"
                            id="adhiereCovid"
                            value={this.state.guia.adhiereCovid}
                            onChange={this.handleAdhiereChange}
                                />
                            <Label> Adhiere Covid </Label>  
                        </FormGroup>
                        <FormGroup check>
                            <Input 
                            type="checkbox"
                            name="adhiereDosep"
                            id="adhiereDosep"
                            value={this.state.guia.adhiereDosep}
                            onChange={this.handleAdhiereChange}
                                />
                            <Label> Adhiere Dosep </Label>  
                        </FormGroup>
                           </Col>



                        <Col
                          xs="12"
                          md="12"
                          className="d-flex justify-content-end"
                        >
                          <Button
                            color="primary"
                            type="button"
                            onClick={this.subirFormulario}
                          >
                            Guardar
                          </Button>
                          &nbsp; &nbsp;
                       { /*<Link to={"/guia/" + this.state.ultimo}>
                            <Button color="primary" type="button">
                              Ver Último
                            </Button>
                          </Link> */}
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </Form>
                <style jsx="true">{`
                  .nav-link {
                    cursor: pointer;
                  }
                `}</style>
              </div>
            )}
          </Col>
        </Row>
        <ModalMsg
          open={this.state.modal.open}
          titulo="Nuevo"
          msg={this.state.modal.msg}
          onlyOk={this.state.modal.onlyOk}
          handleAceptar={this.handleMsgOk}
          nuevo={this.state.modal.nuevo}
        >
          {this.state.modal.extras}
        </ModalMsg>
      </Container>
    );
  }
}

export default Nuevo;

{
  /* 

import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Breadcrumb,
  BreadcrumbItem
} from "reactstrap";
import Loading from "../utils/loading";
import ModalMsg from "../utils/ModalMsg";

class Nuevo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      modal: {
        msg: "",
        redirect: false,
        open: false,
        onlyOk: true
      },
      guia: {
        idciudad: 1,
        idtipo: 1,
        idvalortipcat: 1,
        nombre: "fede",
        legajo: 461,
        domicilio: "",
        telefono: "",
        habitaciones: 0,
        camas: 0,
        plazas: 0,
        mail: "",
        web: "",
        latitud: 0,
        longitud: 0,
        descripcion: "",
        logo: "",
        notas: "",
        lupdate: "",
        iduser: 1,
        activo: 1,
        p_nombre: "",
        p_telefono: "",
        p_mail: "",
        p_domicilio: "",
        p_dni: "",
        r_nombre: "",
        r_telefono: "",
        r_mail: "",
        r_domicilio: "",
        r_dni: "",
        r_cargo: "",
        r_vencimiento: "",
        epoca: "",
        estado: ""
      },
      departamentos: [{ id: 0, nombre: "Cargando..." }],
      ciudades: [{ id: 0, nombre: "Cargando..." }],
      tipos: [{ id: 0, nombre: "Cargando..." }],

      idNew: 0
    };
    this.handleDepartamentoChange = this.handleDepartamentoChange.bind(this);
    this.handleMsgOk = this.handleMsgOk.bind(this);
    this.subirFormulario = this.subirFormulario.bind(this);
    console.log(this.state.guia);
  }

  handleDepartamentoChange = event => {
    const value = event.target.value;
    this.setState(
      prevState => ({
        guia: {
         // ...prevState.guia,
          //iddepartamento: value
        }
      }),
      () => {
        this.getCiudades(value).then(() => {
          const idCity = this.state.ciudades[0].id;
          this.setState(prevState => ({
            guia: {
              //...prevState.guia,
              //idciudad: idCity
            }
          }));
        });
      }
    );
  };

  handleChange = event => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      guia: {
        //...this.state.guia,
        //[name]: value
      }
    });
  };

  handleMsgOk = () => {
    if (this.state.modal.redirect) {
      this.props.history.push(`/guia/${this.state.idNew}`);
    } else {
      this.setState({
        modal: {
          ...this.state.modal,
          open: false
        }
      });
    }
  };

  subirFormulario = event => {
    console.log(this.state.guia);
    this.setState({ loading: true });
    event.preventDefault();
    var data = new FormData();
    data.append("data", event.target);
    for (var [key, value] of Object.entries(this.state.guia)) {
      data.append(key, value);
    }
    //Se pasa el ID del Usuario actual
    console.log("Hola");
    console.log(data);
    fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("WebTurToken")
        //"Content-Type": "multipart/form-data"
      },
      body: this.state.guia
    }).then(res => {
      this.setState({ loading: false });
      if (res.ok && res.status === 200) {
        res.json().then(data => {
          if (data.logo !== this.state.guia.logo) {
            this.setState({
              guia: {
                //...this.state.guia,
               // logo: data.logo
              }
            });
          }
        });
        //this.state.guia.logo
        this.setState({
          modal: {
            ...this.state.modal,
            msg: "Los datos se actualizaron correctamente!",
            open: true
          }
        });
      } else {
        //409 Conflicto
        res.json().then(data => {
          if (data.err === true) {
            let errores = "";
            if (data.errMsgs && Array.isArray(data.errMsgs)) {
              data.errMsgs.forEach(element => {
                errores += `<p>${element}</p>`;
              });
            }
            this.setState({
              modal: {
                ...this.state.modal,
                msg: data.errMsg,
                extras: errores,
                open: true
              }
            });
          } else {
            //Error desconocido OJO!
            this.setState({
              modal: {
                ...this.state.modal,
                msg:
                  "Error desconocido, comunicar al Administrador del sistema esta situación!",
                open: true
              }
            });
          }
        });
      }
    });
  };

  handleSubmit = event => {
    this.setState({ loading: true });
    event.preventDefault();
    var data = new FormData();
    data.append("data", event.target);
    for (var [key, value] of Object.entries(this.state.guia)) {
      data.append(key, value);
    }
    //Se pasa el ID del Usuario actual
    if ("WebTurId" in localStorage) {
      //Siempre debería existir!
      if (localStorage.getItem("WebTurId").length > 0) {
        data.set("iduser", localStorage.getItem("WebTurId"));
      }
    }
    console.log("Hola");
    console.log(data);
    fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("WebTurToken")
        //"Content-Type": "multipart/form-data"
      },
      body: data
    }).then(res => {
      this.setState({ loading: false });
      if (res.ok && res.status === 200) {
        res.json().then(data => {
          if (data.logo !== this.state.guia.logo) {
            this.setState({
              guia: {
                //...this.state.guia,
                //logo: data.logo
              }
            });
          }
        });
        //this.state.guia.logo
        this.setState({
          modal: {
            ...this.state.modal,
            msg: "Los datos se actualizaron correctamente!",
            open: true
          }
        });
      } else {
        //409 Conflicto
        res.json().then(data => {
          if (data.err === true) {
            let errores = "";
            if (data.errMsgs && Array.isArray(data.errMsgs)) {
              data.errMsgs.forEach(element => {
                errores += `<p>${element}</p>`;
              });
            }
            this.setState({
              modal: {
                ...this.state.modal,
                msg: data.errMsg,
                extras: errores,
                open: true
              }
            });
          } else {
            //Error desconocido OJO!
            this.setState({
              modal: {
                ...this.state.modal,
                msg:
                  "Error desconocido, comunicar al Administrador del sistema esta situación!",
                open: true
              }
            });
          }
        });
      }
    });
  };
  getCiudades = idDepartamento => {
    return fetch(
      `${
        process.env.REACT_APP_URL_API_SERVER_2
      }/ciudades/departamento/${idDepartamento}`
    ).then(res => {
      if (res.ok && res.status === 200) {
        res.json().then(data => {
          this.setState(
            {
              ciudades: data.data.registros
            },
            () => {
              this.setState({
                guia: {
                  //...this.state.guia,
                  //idciudad: this.state.ciudades[0].id
                }
              });
            }
          );
        });
      }
    });
  };

  componentDidMount() {
    //Carga de Tipos
    const Tipos = new Promise((resolve, reject) => {
      fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/tipos`, {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("WebTurToken")
        }
      }).then(res => {
        if (res.ok && res.status === 200) {
          res.json().then(data => {
            this.setState(
              {
                tipos: data.data.registros
              },
              () => {
                this.setState(
                  {
                    guia: {
                     // ...this.state.guia,
                      //idtipo: this.state.tipos[0].id
                    }
                  }
                  () => {
                    resolve(true);
                  }
                );
              }
            );
          });
        }
      });
    });
    //Carga de Departamentos
    const Departamentos = new Promise((resolve, reject) => {
      fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/departamentos`, {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("WebTurToken")
        }
      }).then(res => {
        if (res.ok && res.status === 200) {
          res.json().then(data => {
            this.setState(
              {
                departamentos: data.data.registros
              },
              () => {
                this.getCiudades(this.state.departamentos[0].id);
                this.setState(
                  {
                    guia: {
                      ...this.state.guia,
                    }
                  },
                  () => {
                    resolve(true);
                  }
                );
              }
            );
          });
        }
      });
    });
    Promise.all([Tipos, Departamentos]).then(values => {
      this.setState({
        loading: false
      });
    });
  }

  render() {
    const loading = this.state.loading;
    const departamentos = this.state.departamentos.map(d => {
      return (
        <option key={"d-" + d.id} value={d.id}>
          {d.nombre}
        </option>
      );
    });
    const ciudades = this.state.ciudades.map(c => {
      return (
        <option key={"c-" + c.id} value={c.id}>
          {c.nombre}
        </option>
      );
    });
    const tipos = this.state.tipos.map(t => {
      return (
        <option key={"t-" + t.id} value={t.id}>
          {t.descripcion}
        </option>
      );
    });
    return (
      <div className="Nuevo">
        {loading ? (
          <Loading />
        ) : (
          <Container>
            <Row className="justify-content-center">
              <Col style={{ paddingLeft: "0" }} className="col-xs-12 col-md-1">
                <Button
                  style={{ marginLeft: "0" }}
                  color="primary"
                  className="mr-2 btn-lg"
                  onClick={e => this.props.history.push("/")}
                >
                  <i className="fas fa-arrow-circle-left" />
                </Button>
              </Col>
              <Col className="col-xs-12 col-md-3">
                <Breadcrumb>
                  <BreadcrumbItem active>
                    Formulario - Nuevo Registro
                  </BreadcrumbItem>
                </Breadcrumb>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col className="col col-xs-12 col-md-4 mb-4 rounded shadow bg-white pt-4">
                <Form
                  onSubmit={this.handleSubmit}
                  className="pb-5"
                  autoComplete="off"
                >
                  <FormGroup>
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      type="select"
                      className="form-control"
                      id="departamento"
                      name="departamento"
                      value="" //"{this.state.guia.iddepartamento}"
                      onChange={this.handleDepartamentoChange}
                    >
                      {departamentos}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="idciudad">Ciudad</Label>
                    <Input
                      type="select"
                      className="form-control"
                      id="idciudad"
                      name="idciudad"
                      value="" //{this.state.guia.idciudad}
                      onChange={this.handleChange}
                    >
                      {ciudades}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="idtipo">Tipo</Label>
                    <Input
                      type="select"
                      className="form-control"
                      id="idtipo"
                      name="idtipo"
                      value="" //{this.state.guia.idtipo}
                      onChange={this.handleChange}
                    >
                      {tipos}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="legajo">Legajo</Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="legajo"
                      name="legajo"
                      placeholder=""
                      value="" //{this.state.guia.legajo}
                      onChange={this.handleChange}
                      maxLength="5"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="nombre"
                      name="nombre"
                      placeholder=""
                      value="" //{this.state.guia.nombre}
                      onChange={this.handleChange}
                      maxLength="100"
                    />
                  </FormGroup>
                  <Button
                    color="primary"
                    type="submit"
                    className="float-right"
                    onClick={this.subirFormulario}
                  >
                    Guardar y Continuar
                  </Button>
                </Form>
              </Col>
            </Row>
            <ModalMsg
              open={this.state.modal.open}
              titulo="Nueva Guía"
              msg={this.state.modal.msg}
              onlyOk={this.state.modal.onlyOk}
              handleAceptar={this.handleMsgOk}
            />
          </Container>
        )}
      </div>
    );
  }
}

export default Nuevo;
*/
}
