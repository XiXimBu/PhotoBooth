"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connect = async () => {
    const uri = (process.env.MONGOOSE_URL || process.env.MONGO_URI);
    if (!uri || typeof uri !== 'string') {
        console.error('MongoDB connection string is missing. Set MONGOOSE_URL or MONGO_URI in your environment.');
        return;
    }
    try {
        await mongoose_1.default.connect(uri);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
exports.connect = connect;
