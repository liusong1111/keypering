import React from "react";
import { withRouter } from "react-router";
import sha256 from "crypto-js/sha256";
import AuthorizationRequest from "../../widgets/authorization_request";
import Storage from "../../services/storage";
import { sendAck } from "../../services/messaging";

class AuthorizationRequestPage extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { request } = Storage.getStorage();
    this.setState({
      request,
    });
  }

  handleApprove = () => {
    const { history } = this.props;
    const { request } = this.state;
    const { token: wsToken, data } = request;
    const { id, method, params } = data;
    const { origin, description } = params;
    // const timestamp = formatDate(new Date(), "yyyy-MM-dd HH:mm:ss");
    const timestamp = new Date().getTime();
    const authToken = sha256(origin).toString();
    Storage.getStorage().addAuthorization({
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
    const { token, data } = request;
    const { id, method, params } = data;
    const { origin, description } = params;
    return (
      <AuthorizationRequest
        token={token}
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