import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { createConnection } from "typeorm";
import { DataConsumer } from "./entity/DataConsumer";
import * as amqp from "amqplib";

const producer = async () => {
  const queue_get1 = "producer_got"
  const queue_get2 = "producer_got2"
  const queue_cre1 = "producer_created";
  const queue_upt1 = "producer_updated";
  const queue_del1 = "producer_deleted";
  const queue_cre2 = "producer_created2";
  const queue_upt2 = "producer_updated2";
  const queue_del2 = "producer_deleted2";

  // connect rabbitmq
  const connection = await amqp.connect(
    "amqps://vwiugkgc:0s7MKslaqAl55plx6eF5M35weZyuo103@armadillo.rmq.cloudamqp.com/vwiugkgc",
    (errorConnection, connection) => {
      if (errorConnection) {
        throw errorConnection;
      }
      return connection;
    }
  );

  // initialize channels
  const channel1 = await connection.createChannel();
  const channel2 = await connection.createChannel();

  // connect Database
  createConnection().then((db) => {
    const producerRepository = db.getRepository(DataConsumer);
    const port = 8000;

    const app = express();

    // listen cors front end 3000:React 8080:Vue 4200:Angular
    app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "http://localhost:8080",
          "http://localhost:4200",
        ],
      })
    );

    app.use(express.json());

    try {

      // get all data from database producers
      app.get("/api/producers", async (req: Request, res: Response) => {
        const producers = await producerRepository.find();
        channel1.sendToQueue(queue_get1, Buffer.from(JSON.stringify(producers)));
        channel2.sendToQueue(queue_get2, Buffer.from(JSON.stringify(producers)));
        return res.json(producers);
      });

      // add a data to database producers
      app.post("/api/producers", async (req: Request, res: Response) => {
        const producers = await producerRepository.create(req.body);
        const result = await producerRepository.save(producers);
        channel1.sendToQueue(queue_cre1, Buffer.from(JSON.stringify(result)));
        channel2.sendToQueue(queue_cre2, Buffer.from(JSON.stringify(result)));
        return res.send(result);
      });

      // update a data to database producers
      app.put("/api/producers/:id", async (req: Request, res: Response) => {
        const producers = await producerRepository.findOneById(req.params.id);
        producerRepository.merge(producers, req.body);
        const result = await producerRepository.save(producers);
        channel1.sendToQueue(queue_upt1, Buffer.from(JSON.stringify(result)));
        channel2.sendToQueue(queue_upt2, Buffer.from(JSON.stringify(result)));
        res.send(result);
      });

      // delete a data from database producers
      app.delete("/api/producers/:id", async (req: Request, res: Response) => {
        const result = await producerRepository.delete(req.params.id);
        channel1.sendToQueue(
          queue_del1,
          Buffer.from(JSON.stringify(req.params.id))
        );
        channel2.sendToQueue(
          queue_del2,
          Buffer.from(JSON.stringify(req.params.id))
        );
        return res.send(result);
      });

      process.on("beforeExit", () => {
        console.log("closing");
        connection.close();
      });
      console.log(`listen on port ${port}`);
      app.listen(port);
    } catch (error) {
      console.log(error);
    }
  });
};

producer();
