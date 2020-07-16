import React from "react";
import { withRouter } from "react-router";
import sha256 from "crypto-js/sha256";
import AuthorizationRequest from "../../widgets/authorization_request";
import Storage from "../../services/storage";
import { sendAck } from "../../services/keypering_server";

class AuthorizationRequestPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const storage = Storage.getStorage();
    const request = await storage.getCurrentRequest();
    this.setState({
      request,
    });
  }

  handleApprove = async () => {
    const { history } = this.props;
    const { request } = this.state;
    const { token: wsToken, payload } = request;
    const { id, method, params } = payload;
    const { origin, description } = params;
    const timestamp = new Date().getTime();
    const authToken = sha256(origin).toString();
    await Storage.getStorage().addAuthorization({
      token: authToken,
      origin,
      description,
      timestamp,
    });
    sendAck(wsToken, {
      id,
      jsonrpc: "2.0",
      result: {
        token: authToken,
      },
    });
    history.push("/");
  };

  handleDecline = () => {
    console.log("handleDecline");
    const { history } = this.props;
    const { request } = this.state;
    const { token: wsToken, data } = request;
    const { id, method, params } = data;
    sendAck(0, {
      id,
      jsonrpc: "2.0",
      error: {
        code: 1,
        message: "declined",
      },
    });
    history.push("/");
  };

  render() {
    const { history } = this.props;
    const { request } = this.state;
    if (!request) {
      console.log("request is null");
      return null;
    }
    const { token: wsToken, data } = request;
    const { id, method, params } = data;
    const { origin, description } = params;
    return (
      <AuthorizationRequest
        token={wsToken}
        origin={origin}
        description={description}
        history={history}
        handleApprove={this.handleApprove}
        handleDecline={this.handleDecline}
      />
    );
  }
}

export default withRouter(AuthorizationRequestPage);
