import { AnyNsRecord } from "dns";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Container } from "reactstrap";
import NavMenu from "./NavMenu";
// import Keycloak from 'keycloak-js';
import { ApplicationState } from "../store";
import * as AuthenticationStore from "../store/Authentication";

type LayoutProps = AuthenticationStore.AuthenticationState &
  typeof AuthenticationStore.actionCreators &
  React.ReactNode;

class Layout extends React.PureComponent<LayoutProps> {
  //  constructor(props: any) {
  //      super(props);
  //     //  this.state = { keycloak: null, authenticated: false }
  //  }

  componentDidMount() {
    this.props.authenticateUser();

    console.log(
      "Layout.componentDidMount() authenticated = " + this.props.authenticated
    );
    // authenticateUser()

    //  const keycloak = Keycloak('/keycloak.json');
    //  keycloak.init({onLoad: 'login-required'}).then(authenticated => {
    //      this.setState({ keycloak: keycloak, authenticated: authenticated})
    //  })
  }

  public render() {
    if (this.props.keycloak) {
      if (this.props.authenticated)
        return (
          <React.Fragment>
            <NavMenu />
            <Container>{this.props.children}</Container>
          </React.Fragment>
        );
      else return <div>unable to authenticate</div>;
    }

    return <div>initialising keycloak</div>;
  }
}

export default connect(
  (state: ApplicationState) => state.authentication,
  AuthenticationStore.actionCreators
)(Layout as any);
