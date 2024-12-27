import { Configuration } from "../configuration";
import { User } from "./user";

export type WithTurnstile = {
  turnstile_token: string;
};

export type LoginReq = {
  username: string;
  password: string;
} & WithTurnstile;

export type LoginRes = {
  access_token: string;
  user: User;
};

export type RegisterReq = {
  name: string;
  username: string;
  email: string;
  password: string;
} & WithTurnstile;

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

    localStorage.setItem("accessToken", data.access_token);
    this.configuration.accessToken = data.access_token;

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
