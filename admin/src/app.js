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
var amqp = require("amqplib/callback_api");
// connection
(0, typeorm_1.createConnection)().then(function (db) {
    var producerRepository = db.getRepository(DataConsumer_1.DataConsumer);
    var port = 8000;
    amqp.connect("amqps://vwiugkgc:0s7MKslaqAl55plx6eF5M35weZyuo103@armadillo.rmq.cloudamqp.com/vwiugkgc", function (errorConnect, connection) {
        if (errorConnect) {
            throw errorConnect;
        }
        ///// try use channel 1
        try {
            ///// start Channel 1
            connection.createChannel(function (error1, channel) {
                if (error1) {
                    throw error1;
                }
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
                // get all data from database producers
                app.get("/api/producers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var producers;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, producerRepository.find()];
                            case 1:
                                producers = _a.sent();
                                res.json(producers);
                                return [2 /*return*/];
                        }
                    });
                }); });
                // get a data from database producers
                app.get("/api/producers/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var producers;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, producerRepository.findOneById(req.params.id)];
                            case 1:
                                producers = _a.sent();
                                res.json(producers);
                                return [2 /*return*/];
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
                                channel.sendToQueue("producer_created", Buffer.from(JSON.stringify(result)));
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
                                channel.sendToQueue("producer_updated", Buffer.from(JSON.stringify(result)));
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
                                channel.sendToQueue("producer_deleted", Buffer.from(JSON.stringify(req.params.id)));
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                // add a financialamount data to database producers
                app.post("/api/producers/:id/financialamount", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var producers, _a, result;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, producerRepository.findOneById(req.params.id)];
                            case 1:
                                producers = _b.sent();
                                _a = producers;
                                return [4 /*yield*/, req.body.amount];
                            case 2:
                                _a.amount = _b.sent();
                                return [4 /*yield*/, producerRepository.save(producers)];
                            case 3:
                                result = _b.sent();
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                console.log("listen on port ".concat(port));
                app.listen(port);
                process.on("beforeExit", function () {
                    console.log("closing");
                    connection.close();
                });
            });
            ///// end Channel 1
        }
        catch (error) 
        ///// channel 1 crashed
        ///// catch with channel 2 
        {
            ///// use Channel 2 if catch
            ///// log error
            console.log(error);
            ///// end log error
            ///// start Channel 2
            connection.createChannel(function (error2, channel2) {
                if (error2) {
                    throw error2;
                }
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
                // get all data from database producers
                app.get("/api/producers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var producers;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, producerRepository.find()];
                            case 1:
                                producers = _a.sent();
                                res.json(producers);
                                return [2 /*return*/];
                        }
                    });
                }); });
                // get a data from database producers
                app.get("/api/producers/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var producers;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, producerRepository.findOneById(req.params.id)];
                            case 1:
                                producers = _a.sent();
                                res.json(producers);
                                return [2 /*return*/];
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
                                channel2.sendToQueue("producer_created", Buffer.from(JSON.stringify(result)));
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
                                channel2.sendToQueue("producer_updated", Buffer.from(JSON.stringify(result)));
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
                                channel2.sendToQueue("producer_deleted", Buffer.from(JSON.stringify(req.params.id)));
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                // add a financialamount data to database producers
                app.post("/api/producers/:id/financialamount", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var producers, _a, result;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, producerRepository.findOneById(req.params.id)];
                            case 1:
                                producers = _b.sent();
                                _a = producers;
                                return [4 /*yield*/, req.body.amount];
                            case 2:
                                _a.amount = _b.sent();
                                return [4 /*yield*/, producerRepository.save(producers)];
                            case 3:
                                result = _b.sent();
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                console.log("listen on port ".concat(port));
                app.listen(port);
                process.on("beforeExit", function () {
                    console.log("closing");
                    connection.close();
                });
            });
            ///// end Channel 2
        }
    });
});
