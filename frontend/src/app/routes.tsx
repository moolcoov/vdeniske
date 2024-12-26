import { type RouteDefinition } from "@solidjs/router";
import { MainPage } from "../pages/MainPage";
import { MainLayout } from "../widgets/MainLayout";
import { UserPage } from "../pages/UserPage";

export const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "/",
        component: MainPage,
      },
      {
        path: "/users/:userId",
        component: UserPage,
      },
    ],
  },
] satisfies RouteDefinition[];
