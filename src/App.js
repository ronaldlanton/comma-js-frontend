import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./pages/Login";
import Conversations from "./pages/Conversations";
import Splits from "./pages/Splits";
import NewConversation from "./pages/NewConversation";
import NewSplit from "./pages/NewSplit";
import Settings from "./pages/Settings";
import EditProfile from "./pages/EditProfile";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Cookies from "universal-cookie";

import "./App.css";
import setTheme from "./helpers/themeSetter";

function App() {
  const cookies = new Cookies();

  useEffect(() => {
    var darkThemePreference =
      cookies.get("darkThemePreference") === "false" ? false : true;

    setTheme(darkThemePreference ? "dark" : "light");
    // eslint-disable-next-line
  }, []);

  return (
    <Router>
      <Route
        render={({ location }) => (
          <TransitionGroup>
            <CSSTransition
              key={location.key}
              classNames="page"
              timeout={{ enter: 300, exit: 300 }}
            >
              <Switch location={location}>
                <Route path="/" exact component={Login} />
                <Route path="/conversations" exact component={Conversations} />
                <Route path="/splits" exact component={Splits} />
                <Route
                  path="/new-conversation"
                  exact
                  component={NewConversation}
                />
                <Route path="/new-split" exact component={NewSplit} />
                <Route path="/settings" exact component={Settings} />
                <Route path="/edit-profile" exact component={EditProfile} />
              </Switch>
            </CSSTransition>
          </TransitionGroup>
        )}
      />
    </Router>
  );
}

export default App;
