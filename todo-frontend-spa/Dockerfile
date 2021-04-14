FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish "todo-frontend-spa.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
EXPOSE 80
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "todo-frontend-spa.dll"]
