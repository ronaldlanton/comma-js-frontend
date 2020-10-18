import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./pages/Login";
import Conversations from "./pages/Conversations";
import Miniversations from "./pages/Miniversations";
import NewConversation from "./pages/NewConversation";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Container from '@material-ui/core/Container';
import "./App.css";

function App() {
  return (
    <Router>
      <Route
        render={({ location }) => (
            <TransitionGroup>
              <CSSTransition key={location.key} classNames="page" timeout={{enter: 300, exit: 200}}>
                <Switch location={location}>
                  <Route path="/" exact component={Login} />
                  <Route
                    path="/conversations"
                    exact
                    component={Conversations}
                  />
                  <Route
                    path="/miniversations"
                    exact
                    component={Miniversations}
                  />
                  <Route
                    path="/new-conversation"
                    exact
                    component={NewConversation}
                  />
                </Switch>
              </CSSTransition>
            </TransitionGroup>
        )}
      />
    </Router>
  );
}

export default App;
