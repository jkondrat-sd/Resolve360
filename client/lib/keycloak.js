import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080/auth",
  realm: "resolve360",
  clientId: "resolve360-client-public", // public client for frontend
});

export default keycloak;
