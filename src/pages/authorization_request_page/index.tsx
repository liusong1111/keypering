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
    const { token, data } = request;
    const { origin, description } = data;
    // const timestamp = formatDate(new Date(), "yyyy-MM-dd HH:mm:ss");
    const timestamp = new Date().getTime();
    const authToken = sha256(origin).toString();
    Storage.getStorage().addAuthorization({
      token: authToken,
      origin,
      description,
      timestamp,
    });
    sendAck(token, {
      type: "auth",
      success: true,
      message: "authorized",
      token: authToken,
    });
    history.push("/");
  };

  handleDecline = () => {
    console.log("handleDecline");
    const { history } = this.props;
    sendAck(0, {
      type: "auth",
      success: false,
      message: "declined",
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
    const { origin, description } = data;
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
