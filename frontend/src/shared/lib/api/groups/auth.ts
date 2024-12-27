import { Configuration } from "../configuration";
import { User } from "./user";

export type LoginReq = {
  username: string;
  password: string;
  turnstile_token: string;
};

export type LoginRes = {
  accessToken: string;
  user: User;
};

export type RegisterReq = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type RegisterRes = User;

export class AuthController {
  constructor(private configuration: Configuration) {}

  async login(req: LoginReq): Promise<LoginRes> {
    const res = await fetch(`${this.configuration.basePath}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = (await res.json()) as LoginRes;

    localStorage.setItem("accessToken", data.accessToken);
    this.configuration.accessToken = data.accessToken;

    return data;
  }

  async register(req: RegisterReq): Promise<RegisterRes> {
    const res = await fetch(`${this.configuration.basePath}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();

    return data;
  }
}
