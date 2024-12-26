export class Configuration {
  #accessToken: string | undefined;
  basePath: string;

  constructor(accessToken: string | undefined, basePath: string) {
    this.#accessToken = accessToken;
    this.basePath = basePath;
  }

  get accessToken(): string | undefined {
    return "Bearer " + this.#accessToken;
  }

  set accessToken(value: string | undefined) {
    this.#accessToken = value;
  }

  public reloadToken() {
    this.#accessToken = localStorage.getItem("accessToken") || undefined;
  }
}
