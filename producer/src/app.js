"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
var DataConsumer_1 = require("./entity/DataConsumer");
var amqp = require("amqplib");
var producer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var queue_get1, queue_get2, queue_cre1, queue_upt1, queue_del1, queue_cre2, queue_upt2, queue_del2, connection, channel1, channel2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                queue_get1 = "producer_got";
                queue_get2 = "producer_got2";
                queue_cre1 = "producer_created";
                queue_upt1 = "producer_updated";
                queue_del1 = "producer_deleted";
                queue_cre2 = "producer_created2";
                queue_upt2 = "producer_updated2";
                queue_del2 = "producer_deleted2";
                return [4 /*yield*/, amqp.connect("amqps://vwiugkgc:0s7MKslaqAl55plx6eF5M35weZyuo103@armadillo.rmq.cloudamqp.com/vwiugkgc", function (errorConnection, connection) {
                        if (errorConnection) {
                            throw errorConnection;
                        }
                        return connection;
                    })];
            case 1:
                connection = _a.sent();
                return [4 /*yield*/, connection.createChannel()];
            case 2:
                channel1 = _a.sent();
                return [4 /*yield*/, connection.createChannel()];
            case 3:
                channel2 = _a.sent();
                // connect Database
                (0, typeorm_1.createConnection)().then(function (db) {
                    var producerRepository = db.getRepository(DataConsumer_1.DataConsumer);
                    var port = 8000;
                    var app = express();
                    // listen cors front end 3000:React 8080:Vue 4200:Angular
                    app.use(cors({
                        origin: [
                            "http://localhost:3000",
                            "http://localhost:8080",
                            "http://localhost:4200",
                        ],
                    }));
                    app.use(express.json());
                    try {
                        // get all data from database producers
                        app.get("/api/producers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                            var producers;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, producerRepository.find()];
                                    case 1:
                                        producers = _a.sent();
                                        try {
                                            channel1.sendToQueue(queue_get1, Buffer.from(JSON.stringify(producers)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                            channel2.sendToQueue(queue_get2, Buffer.from(JSON.stringify(producers)));
                                            return [2 /*return*/, res.json(producers)];
                                        }
                                        try {
                                            channel2.sendToQueue(queue_get2, Buffer.from(JSON.stringify(producers)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                        }
                                        return [2 /*return*/, res.json(producers)];
                                }
                            });
                        }); });
                        // add a data to database producers
                        app.post("/api/producers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                            var producers, result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, producerRepository.create(req.body)];
                                    case 1:
                                        producers = _a.sent();
                                        return [4 /*yield*/, producerRepository.save(producers)];
                                    case 2:
                                        result = _a.sent();
                                        try {
                                            channel1.sendToQueue(queue_cre1, Buffer.from(JSON.stringify(result)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                            channel2.sendToQueue(queue_cre2, Buffer.from(JSON.stringify(result)));
                                            return [2 /*return*/, res.json(result)];
                                        }
                                        try {
                                            channel2.sendToQueue(queue_cre2, Buffer.from(JSON.stringify(result)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                        }
                                        return [2 /*return*/, res.send(result)];
                                }
                            });
                        }); });
                        // update a data to database producers
                        app.put("/api/producers/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                            var producers, result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, producerRepository.findOneById(req.params.id)];
                                    case 1:
                                        producers = _a.sent();
                                        producerRepository.merge(producers, req.body);
                                        return [4 /*yield*/, producerRepository.save(producers)];
                                    case 2:
                                        result = _a.sent();
                                        try {
                                            channel1.sendToQueue(queue_upt1, Buffer.from(JSON.stringify(result)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                            channel2.sendToQueue(queue_upt2, Buffer.from(JSON.stringify(result)));
                                            return [2 /*return*/, res.json(result)];
                                        }
                                        try {
                                            channel2.sendToQueue(queue_upt2, Buffer.from(JSON.stringify(result)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                        }
                                        return [2 /*return*/, res.send(result)];
                                }
                            });
                        }); });
                        // delete a data from database producers
                        app.delete("/api/producers/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, producerRepository.delete(req.params.id)];
                                    case 1:
                                        result = _a.sent();
                                        try {
                                            channel1.sendToQueue(queue_del1, Buffer.from(JSON.stringify(req.params.id)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                            channel2.sendToQueue(queue_del2, Buffer.from(JSON.stringify(req.params.id)));
                                            return [2 /*return*/, res.json(result)];
                                        }
                                        try {
                                            channel2.sendToQueue(queue_del2, Buffer.from(JSON.stringify(req.params.id)));
                                        }
                                        catch (error) {
                                            console.log(error);
                                        }
                                        return [2 /*return*/, res.send(result)];
                                }
                            });
                        }); });
                        process.on("beforeExit", function () {
                            console.log("closing");
                            connection.close();
                        });
                        console.log("listen on port ".concat(port));
                        app.listen(port);
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
                return [2 /*return*/];
        }
    });
}); };
producer();
