import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./pages/Login";
import Conversations from "./pages/Conversations";
import Miniversations from "./pages/Miniversations";
import NewConversation from "./pages/NewConversation";
import "./App.css";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/conversations" exact component={Conversations} />
        <Route path="/miniversations" exact component={Miniversations} />
        <Route
          path="/new-conversation"
          exact
          component={NewConversation}
        />
      </Switch>
    </Router>
  );
}

export default App;
