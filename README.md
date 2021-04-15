A reference pattern, for authenticating a SPA frontend, and its associated backend.

To abstract the application away from concerns such as kerberos/ldap, are fronting these protocols with Open ID Connection (OIDC) using Keycloak.

# Setup

1. `dotnet restore` in project root
1. Spin up keycloak using provided `docker-compose.yml`.
1. Create a _realm_
1. Create a _client_, with a client protocol of openid-connect, access types of _public_.
1. Still on the _client_, jump over to the _Installation_ tab, and set the format option to _Keycloak OIDC JSON_. Save the JSON to the `public` directory in the SPA tree.
1.

Keycloak Installation JSON:

```json
{
  "realm": "demo-realm",
  "auth-server-url": "http://localhost:8080/auth/",
  "ssl-required": "external",
  "resource": "react-client",
  "public-client": true,
  "confidential-port": 0
}
```

# Usage

The reference SPA application, uses the JavaScript keycloak adapter.

# Decoded JWT token

## Header

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "74mc3N1KOp3MqBFYf8D_ceIHIaCOk_asrttEMDZq9xI"
}
```

## Payload

```json
{
  "exp": 1617929881,
  "iat": 1617929581,
  "auth_time": 1617929577,
  "jti": "ddda102c-39e0-4c3e-b05a-2708b860026e",
  "iss": "http://localhost:8080/auth/realms/demo-realm",
  "aud": "account",
  "sub": "e90fea87-7b68-406a-aef3-d6bfc724d6c7",
  "typ": "Bearer",
  "azp": "react-client",
  "nonce": "5dc03a7c-0432-417b-8e10-397d4fd66ba4",
  "session_state": "f268478d-ddc4-4cad-8033-d9f9c85b9f9d",
  "acr": "1",
  "allowed-origins": ["https://localhost:5001"],
  "realm_access": {
    "roles": ["offline_access", "uma_authorization"]
  },
  "resource_access": {
    "account": {
      "roles": ["manage-account", "manage-account-links", "view-profile"]
    }
  },
  "scope": "openid profile email",
  "email_verified": false,
  "name": "Luke Watson",
  "preferred_username": "watto",
  "given_name": "Luke",
  "family_name": "Watson"
}
```

## Signature

```
RSASHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  public_key
)
```

# Troubleshooting

## IDX20803: Unable to obtain configuration

When the dotnet backend attempts to valid the token, attempts to query the `openid-configuration` document from the realm.

In a containerised environment, this must be routable from the dotnet backend container to the keycloak container.

This endpoint is defined in the frontend application in `public/keycloak.json` (originally downloaded from the install tab on the keycloak client).

To get around this, configure the endpoint as the container name, `oidc-pattern-keycloak`, which docker will make addressable from the backend container to the keycloak container.

```
System.InvalidOperationException: IDX20803: Unable to obtain configuration from: 'http://localhost:8080/auth/realms/demo-realm/.well-known/openid-configuration'.
 ---> Microsoft.IdentityModel.Json.JsonReaderException: Unexpected character encountered while parsing value: <. Path '', line 0, position 0.
   at Microsoft.IdentityModel.Json.JsonTextReader.ParseValue()
   at Microsoft.IdentityModel.Json.JsonReader.ReadAndMoveToContent()
   at Microsoft.IdentityModel.Json.JsonReader.ReadForType(JsonContract contract, Boolean hasConverter)
   at Microsoft.IdentityModel.Json.Serialization.JsonSerializerInternalReader.Deserialize(JsonReader reader, Type objectType, Boolean checkAdditionalContent)
   at Microsoft.IdentityModel.Json.JsonSerializer.DeserializeInternal(JsonReader reader, Type objectType)
   at Microsoft.IdentityModel.Json.JsonSerializer.Deserialize(JsonReader reader, Type objectType)
   at Microsoft.IdentityModel.Json.JsonConvert.DeserializeObject(String value, Type type, JsonSerializerSettings settings)
   at Microsoft.IdentityModel.Json.JsonConvert.DeserializeObject[T](String value, JsonSerializerSettings settings)
   at Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectConfigurationRetriever.GetAsync(String address, IDocumentRetriever retriever, CancellationToken cancel)
   at Microsoft.IdentityModel.Protocols.ConfigurationManager`1.GetConfigurationAsync(CancellationToken cancel)
   --- End of inner exception stack trace ---
   at Microsoft.IdentityModel.Protocols.ConfigurationManager`1.GetConfigurationAsync(CancellationToken cancel)
   at Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerHandler.HandleAuthenticateAsync()
```

## Error: ENOSPC: System limit for number of file watchers reached

Open this kernel throttle up:

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

# Resources

- [keycloak javascript adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
-

# Noteworthy

The _access type_ of the OIDC client supports 3 modes:

- `Bearer-only` – this is for services that rely solely on the bearer token included in the request and never initiate login on their own. Used for securing the back-end.
- `Confidential` – clients of this type need to provide a secret in order to initiate the login process.
- `Public` – since we have no real way of hiding the secret in a JS-based browser app, this is what we need to stick with.
