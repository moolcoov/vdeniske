import { Configuration } from "./configuration";
import { AuthController } from "./groups/auth";
import { PostController } from "./groups/post";
import { UserController } from "./groups/user";

const conf = new Configuration(
  localStorage.getItem("accessToken") || undefined,
  // "http://localhost:3000/api/v1"
  "http://192.168.1.13:3000/api/v1"
);

const authApi = new AuthController(conf);
const postApi = new PostController(conf);
const userApi = new UserController(conf);

export { conf, authApi, postApi, userApi };
