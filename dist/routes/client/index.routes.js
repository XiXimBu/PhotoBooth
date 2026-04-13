"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const home_routes_1 = __importDefault(require("./home.routes"));
const home_controller_1 = __importDefault(require("../../controllers/client/home.controller"));
const clientRoutes = (app) => {
    app.get("/", home_controller_1.default.getHome);
    app.use(`/home`, home_routes_1.default);
};
exports.default = clientRoutes;
