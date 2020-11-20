import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Input, Col, Table, FormGroup, Label } from "reactstrap";
import ModalMsg from "../../utils/ModalMsg";

class Actas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      advertencia: this.props.advertencia,
      iduser: this.props.idUser,
      idGuia: this.props.idGuia,
      menu: this.props.menu,
      menu_opt_sistema: true,
      descripcion: "",
      fecha_acta: "",
      actas: [],
      filtro: "",
      modalRedes: {
        open: false,
        msg: "Redes Sociales",
        onlyOk: false
      },
      deleteId: 0
    };
    this.findRedes = this.findRedes.bind(this);
    this.handleDeleteRed = this.handleDeleteRed.bind(this);
    this.handleAddRed = this.handleAddRed.bind(this);
    this.handleRedesMsgOk = this.handleRedesMsgOk.bind(this);
    this.handleRedesMsgClose = this.handleRedesMsgClose.bind(this);
    this.findGuias = this.findGuias.bind(this);
    this.handleFiltroChange = this.handleFiltroChange.bind(this);
  }

  handleFiltroChange = event => {
    let texto = event.target.value.toLowerCase();
    this.setState({ filtro: texto });
    let buffer = this.state.actas.map(v => {
      let inLegajo = v.id.toLowerCase().search(texto);
      let inNombre = v.nombre.toLowerCase().search(texto);
      if (inLegajo > -1 || inNombre > -1) {
        return {
          id: v.id,
          fecha_acta: v.fecha_acta,
          descripcion: v.descripcion,
          nombre: v.nombre,
          estilo: { display: "table-row" }
        };
      } else {
        return {
          id: v.id,
          fecha_acta: v.fecha_acta,
          descripcion: v.descripcion,
          nombre: v.nombre,
          estilo: { display: "none" }
        };
      }
    });
    this.setState({ actas: buffer });
  };

  handleRedesMsgClose = () => {
    this.setState({
      modalRedes: {
        ...this.state.modalRedes,
        open: false
      }
    });
  };

  handleRedesMsgOk = () => {
    //Eliminar la Red
    this.setState(
      {
        modalRedes: {
          ...this.state.modalRedes,
          open: false
        },
        loading: true
      },
      () => {
        fetch(
          `${process.env.REACT_APP_URL_API_SERVER_2}/guia/red/${
            this.state.deleteId
          }`,
          {
            method: "DELETE",
            headers: {
              Authorization: localStorage.getItem("WebTurToken")
            }
          }
        ).then(res => {
          if (res.ok && res.status === 200) {
            this.findRedes();
            this.setState({
              menu_opt_sistema: true,
              descripcion: ""
            });
          }
        });
      }
    );
  };
  componentDidUpdate(prevProps) {}
  handleChange = event => {
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

    this.setState({
      actas: {
        ...this.state.actas,
        [name]: value
      }
    });
  };

  handleAddRed = () => {
    this.setState(
      {
        loading: true
      },
      () => {
        fetch(
          `${process.env.REACT_APP_URL_API_SERVER_2}/acta/${
            this.state.idGuia
          }/add/${this.state.iduser}`,
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem("WebTurToken"),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              descripcion: this.state.descripcion,
              fecha_acta: this.state.fecha_acta
            })
          }
        ).then(res => {
          if (res.ok && res.status === 201) {
            this.findRedes();
          } else {
            res.json().then(data => {
              this.setState(
                {
                  loading: false
                },
                () => {
                  alert(data.errMsg);
                }
              );
            });
          }
        });
      }
    );
  };
  findGuias = () => {
    fetch(
      `${process.env.REACT_APP_URL_API_SERVER_2}/actas/${this.state.idGuia}`,
      {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("WebTurToken")
        }
      }
    ).then(res => {
      if (res.ok && res.status === 200) {
        res.json().then(data => {
          let datos = data.data.registros.map(d => {
            return {
              id: d.id,
              fecha_acta: d.fecha_acta,
              descripcion: d.descripcion,
              nombre: d.nombre,
              estilo: { display: "table-row" }
            };
          });
          this.setState({
            loading: false,
            actas: datos
          });
        });
      }
    });
  };

  handleDeleteRed = (id, nombre) => {
    this.setState({
      modalRedes: {
        ...this.state.modalRedes,
        msg: `Seguro de eliminar ${nombre}?`,
        open: true
      },
      deleteId: id
    });
  };

  findRedes = () => {
    //Obtener las Redes Sociales
    this.setState({ loading: false });
    this.findGuias();
  };

  componentDidMount() {
    this.findGuias();
    this.findRedes();
  }

  render() {
    const loading = this.state.loading;
    const menu = this.state.menu;
    const menu_opt_sistema = this.state.menu_opt_sistema;
    const actas = this.state.actas;

    return (
      <div className="Redes">
        {loading ? (
          <Loading />
        ) : (
          <div className="mb-4">
            <Row>
              <Col xs="12" md="12">
                <div className="d-flex flex-column justify-content-start mb-3">
                  <label>Nueva Acta</label>
                  {menu && menu_opt_sistema ? (
                    <div className="row">
                      <div className="col-xs-1 col-md-4">
                        <div className="form-group">
                          <label htmlFor="idred">Fecha</label>
                          <input
                            type="date"
                            className="form-control"
                            name="fecha_acta"
                            id="fecha_acta"
                            value={this.state.fecha_acta}
                            onChange={e =>
                              this.setState({ fecha_acta: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-xs-16 col-md-40">
                        <div className="form-group">
                          <label htmlFor="descripcion">Hallazgos</label>
                          <div className="input-group">
                            <textarea
                              name="textarea"
                              rows="10"
                              cols="50"
                              className="form-control"
                              name="descripcion"
                              id="descripcion"
                              value={this.state.descripcion}
                              placeholder="Descripción de el Acta"
                              onChange={e =>
                                this.setState({ descripcion: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-xs-6 col-md-1 d-flex justify-content-end align-items-center">
                        <button
                          type="button"
                          className="btn btn-primary ml-2 mt-2"
                          onClick={this.handleAddRed}
                        >
                          <i className="fas fa-arrow-circle-down" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <hr />
                  <div className="d-flex flex-wrap justify-content-start" />
                  {this.state.advertencia ? (
                    <div className="alert alert-warning mt-4" role="alert">
                      Advertencia!: El Acta se genera y se guarda
                      automaticamente.
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="Guias">
                    {loading ? (
                      <Loading />
                    ) : (
                      <div className="mb-2 rounded shadow p-2 bg-white">
                        <div>
                          <FormGroup>
                            <Label for="filtro">Filtrar</Label>
                            <Input
                              type="text"
                              name="filtro"
                              id="filtro"
                              placeholder="Buscar Legajo/Nombre"
                              value={this.state.filtro}
                              onChange={this.handleFiltroChange}
                            />
                          </FormGroup>
                        </div>
                        <div className="table-responsive">
                          <Table bordered striped hover>
                            <caption>Listado de Guias</caption>
                            <thead>
                              <tr>
                                <th scope="col">N° Acta</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Descripción</th>
                                <th scope="col">Fecha</th>
                                <th scope="col" />
                              </tr>
                            </thead>
                            <tbody>
                              {actas.map(v => {
                                return "1" === "1" ? (
                                  <tr key={v.id} style={v.estilo}>
                                    <th scope="row">
                                        {v.id}
                                    </th>
                                    <td>{v.nombre}</td>
                                    <td>{v.descripcion}</td>
                                    <td>{v.fecha_acta}</td>
                                  </tr>
                                ) : (
                                  ""
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
        <style jsx="true">{`
          .badge-pill {
            padding: 8px;
            font-size: 18px;
            margin-right: 5px;
            margin-bottom: 5px;
          }
          .fa-times-circle {
            cursor: pointer;
          }
          .icon-social {
            margin-right: 8px;
          }
          .social-link {
            text-decoration: none;
            color: #fff;
          }
          @media only screen and (max-width: 575px) {
            .flex-xs-column {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default Actas;
