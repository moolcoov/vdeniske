import { Router } from "@solidjs/router"
import { routes } from "./routes"

export const App = () => {
  return <Router children={routes} />
}