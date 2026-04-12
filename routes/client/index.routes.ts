import homeRoutes from "./home.routes";
import HomeController from "../../controllers/client/home.controller";

import { Express } from "express";

const clientRoutes = (app: Express): void => {

  app.get("/", HomeController.getHome);
  app.use(`/home`, homeRoutes);
};

export default clientRoutes;