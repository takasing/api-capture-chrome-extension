import React from "react";
import Panel from "./CreatePanels";
import "./DevToolsPanel.css";
import "./CreatePanels.css";

// Known API calls that the Rubrik UI uses for internal functionality checks
const helperApiCalls = [
  "/internal/cluster/me/is_registered",
  "/internal/cluster/me/is_azure_cloud_only",
  "/internal/cluster/me/is_registered",
  "/internal/cluster/me/is_encrypted",
  "/internal/cluster/me/platforminfo",
  "/internal/cluster/me/ui_preference",
  "/internal/cluster/log",
  "/internal/node_management/is_bootstrapped",
  "/internal/log",
  "/internal/cluster/me/security_classification",
  "/internal/config/crystal",
  "/internal/authorization/effective/for_resource",
];

export default class DevToolsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiCalls: [],
    };
  }

  scrollToBottomRef = React.createRef();

  handleNetworkRequest = (request) => {
    let isRubrikApiCall = false;
    let path;

    for (const header of request.request.headers) {
      if (header["name"] === "rk-web-app-request") {
        isRubrikApiCall = true;
      }
      if (header["name"] === ":path") {
        path = header["value"].replace("/api", "");
      }
    }

    if (isRubrikApiCall && !helperApiCalls.includes(path)) {
      request.getContent((content, encoding) => {
        this.setState({
          apiCalls: [
            ...this.state.apiCalls,
            {
              id: this.state.apiCalls.length + 1,
              status: request.response.status,
              httpMethod: request.request.method,
              path: path,
              responseTime: request.time,
              responseBody: content,
            },
          ],
        });
      });
    }
    console.log(this.state.apiCalls);
  };

  scrollToBottom = () => {
    this.scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  componentDidMount() {
    this.props.networkRequest.addListener(this.handleNetworkRequest);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  static propTypes = {
    networkRequest: React.PropTypes.object.isRequired,
  };

  render() {
    return (
      <>
        <div class="panel-header-padding">
          <div className="header-container">
            <div className="requestMethodHeader">Method&emsp;</div>
            <div className="endpointHeader">&emsp;API Endpoint</div>

            <div className="responseTime">Response Time&emsp;</div>
          </div>
        </div>
        <div ref={(ref) => (this.newData = ref)}>
          {this.state.apiCalls.map((apiCall) => {
            return (
              <Panel
                id={apiCall["id"]}
                status={apiCall["status"]}
                method={apiCall["httpMethod"]}
                path={apiCall["path"]}
                responseBody={apiCall["responseBody"]}
                responseTime={apiCall["responseTime"]}
              />
            );
          })}
        </div>
        <div
          style={{ float: "left", clear: "both" }}
          ref={this.scrollToBottomRef}
        ></div>
      </>
    );
  }
}
