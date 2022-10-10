"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var amqp = require("amqplib/callback_api");
var port = 8001;
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
    amqp.connect("amqps://vwiugkgc:0s7MKslaqAl55plx6eF5M35weZyuo103@armadillo.rmq.cloudamqp.com/vwiugkgc", function (errorConnection, connection) {
        if (errorConnection) {
            throw errorConnection;
        }
        connection.createChannel(function (error, channel) {
            if (error) {
                throw error;
            }
            // Broker
            channel.assertQueue("producer_got", { durable: false });
            channel.assertQueue("producer_got2", { durable: false });
            channel.assertQueue("producer_created", { durable: false });
            channel.assertQueue("producer_updated", { durable: false });
            channel.assertQueue("producer_deleted", { durable: false });
            channel.assertQueue("producer_created2", { durable: false });
            channel.assertQueue("producer_updated2", { durable: false });
            channel.assertQueue("producer_deleted2", { durable: false });
            // consumer
            channel.consume("producer_got", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_got - worker 1 :", eventProducer);
            }, { noAck: true });
            channel.consume("producer_created", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_created - worker 1 :", eventProducer);
            }, { noAck: true });
            channel.consume("producer_updated", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_updated - worker 1 :", eventProducer);
            }, { noAck: true });
            channel.consume("producer_deleted", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_deleted - worker 1 id:", eventProducer);
            }, { noAck: true });
            channel.consume("producer_got2", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_got - worker 2 :", eventProducer);
            }, { noAck: true });
            channel.consume("producer_created2", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_created - worker 2 :", eventProducer);
            }, { noAck: true });
            channel.consume("producer_updated2", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_updated - worker 2 :", eventProducer);
            }, { noAck: true });
            channel.consume("producer_deleted2", function (msg) {
                var eventProducer = JSON.parse(msg.content.toString());
                console.log("producer_deleted - worker 2 id:", eventProducer);
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
