"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const index_routes_1 = __importDefault(require("./routes/client/index.routes"));
const frame_routes_1 = __importDefault(require("./routes/client/frame.routes"));
const frames_controller_1 = require("./controllers/client/frames.controller");
const database = __importStar(require("./config/database"));
const app = (0, express_1.default)();
app.use(express_1.default.static("public"));
app.set('views', './views');
app.set('view engine', 'pug');
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true,
}));
database.connect();
(0, index_routes_1.default)(app);
app.get("/api/frames-by-layout", frames_controller_1.getFramesForLayout);
app.get("/api/frames/for-layout", frames_controller_1.getFramesForLayout);
app.use("/api", frame_routes_1.default);
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    if (res.headersSent) {
        next(error);
        return;
    }
    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
    });
});
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
