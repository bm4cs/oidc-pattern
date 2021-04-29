FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build

ENV NODE_VERSION=14.16.1
RUN curl https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64-usdt.tar.gz --output node-v$NODE_VERSION-linux-x64-usdt.tar.gz --silent \
    && tar -xzf "node-v$NODE_VERSION-linux-x64-usdt.tar.gz" -C /usr/local --strip-components=1 --no-same-owner \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
    && rm "node-v$NODE_VERSION-linux-x64-usdt.tar.gz"

WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish "todo-frontend-spa.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
EXPOSE 5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "todo-frontend-spa.dll"]
