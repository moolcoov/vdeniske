import { Configuration } from "../configuration";

export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
};

export class UserController {
  constructor(private config: Configuration) {}

  async getUser(userId: string): Promise<User | undefined> {
    const res = await fetch(`${this.config.basePath}/users/${userId}`);

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();

    return data;
  }

  async getMe(): Promise<User | undefined> {
    const res = await fetch(`${this.config.basePath}/users/me`, {
      headers: {
        Authorization: this.config.accessToken || "",
      },
    });

    return res.json();
  }
}
