"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var amqp = require("amqplib/callback_api");
var port = 8001;
try {
    amqp.connect("amqps://vwiugkgc:0s7MKslaqAl55plx6eF5M35weZyuo103@armadillo.rmq.cloudamqp.com/vwiugkgc", function (errorConnection, connection) {
        if (errorConnection) {
            throw errorConnection;
        }
        connection.createChannel(function (error, channel) {
            if (error) {
                throw error;
            }
            channel.assertQueue("producer_created", { durable: false });
            channel.assertQueue("producer_updated", { durable: false });
            channel.assertQueue("producer_deleted", { durable: false });
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
            channel.consume("producer_created", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_created", eventProducer);
            }, { noAck: true });
            channel.consume("producer_updated", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_updated", eventProducer);
            }, { noAck: true });
            channel.consume("producer_deleted", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_deleted id:", eventProducer);
            }, { noAck: true });
            console.log("listen on port ".concat(port));
            app.listen(port);
            process.on("beforeExit", function () {
                console.log("closing");
                connection.close();
            });
        });
    });
}
catch (error) {
    console.log(error);
}
