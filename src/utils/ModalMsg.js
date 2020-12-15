import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ModalMsg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      msg: "",
      onlyOk: false,
    };
    this.msgActivar = this.msgActivar.bind(this);
  }
  msgActivar() {
    console.log("msgactivar");
    if (this.props.msg == "Los datos se actualizaron correctamente!") {
      fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/guia/ultimo").then(
        (res) => {
          if (res.ok && res.status === 200) {
            res.json().then((data) => {
              /*  this.setState({
                    ultimo: data.data.registros[0].id,
                  }); */
              console.log(data.data.registros[0].id);

              if (window.location.hostname === "localhost") {
                window.location.href = `http://localhost:3000/#/guia/${data.data.registros[0].id}`;
                //console.log(this.state.ultimo);
              } else {
                console.log(this.state.ultimo);
                window.location.href = `http://turismo.sanluis.gov.ar/#${data.data.registros[0].id}`;
              }
            });
          }
        }
      );
    } else {
      this.props.handleAceptar();
    }
  }
  componentDidMount() {
    this.setState({
      open: this.props.open,
      msg: this.props.msg,
      onlyOk: this.props.onlyOk,
    });
  }

  componentWillUpdate(prevProps) {
    if (this.props.msg !== prevProps.msg) {
      this.setState({ msg: this.props.msg });
    }
    if (this.props.onlyOk !== prevProps.onlyOk) {
      this.setState({ onlyOk: this.props.onlyOk });
    }
    if (this.props.open !== prevProps.open) {
      this.setState({ open: this.props.open });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.msg !== prevProps.msg) {
      this.setState({ msg: this.props.msg });
    }
    if (this.props.onlyOk !== prevProps.onlyOk) {
      this.setState({ onlyOk: this.props.onlyOk });
    }
    if (this.props.open !== prevProps.open) {
      this.setState({ open: this.props.open });
    }
  }

  render() {
    const msg = this.state.msg;
    const onlyOk = this.state.onlyOk;
    return (
      <div className="ModalMsg">
        <Modal isOpen={this.state.open} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>{this.props.titulo}</ModalHeader>
          <ModalBody>
            <div>{msg}</div>
            {this.props.children}
          </ModalBody>
          <ModalFooter>
            {onlyOk ? (
              <Button
                color="primary"
              /*  onClick={() => {
                  this.msgActivar();
                 // this.props.handleAceptar
                 
                }}*/
                onClick={this.props.handleAceptar}
              >
                Aceptar
              </Button>
            ) : (
              <div>
                <Button color="primary" onClick={this.props.handleAceptar}>
                  Aceptar
                </Button>{" "}
                <Button color="secondary" onClick={this.props.handleCancelar}>
                  Cancelar
                </Button>
              </div>
            )}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ModalMsg;
