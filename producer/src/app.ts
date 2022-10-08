import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { createConnection } from "typeorm";
import { DataConsumer } from "./entity/DataConsumer";
import * as amqp from "amqplib/callback_api";

// connection
createConnection().then((db) => {
  const producerRepository = db.getRepository(DataConsumer);
  const port = 8000;

  amqp.connect(
    "amqps://vwiugkgc:0s7MKslaqAl55plx6eF5M35weZyuo103@armadillo.rmq.cloudamqp.com/vwiugkgc",
    (errorConnect, connection) => {
      if (errorConnect) {
        throw errorConnect;
      }

      ///// try use channel 1
      try {
        ///// start Channel 1
        connection.createChannel((error1, channel) => {
          if (error1) {
            throw error1;
          }

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

          // get all data from database producers
          app.get("/api/producers", async (req: Request, res: Response) => {
            const producers = await producerRepository.find();
            res.json(producers);
          });

          // get a data from database producers
          app.get("/api/producers/:id", async (req: Request, res: Response) => {
            const producers = await producerRepository.findOneById(
              req.params.id
            );
            res.json(producers);
          });

          // add a data to database producers
          app.post("/api/producers", async (req: Request, res: Response) => {
            const producers = await producerRepository.create(req.body);
            const result = await producerRepository.save(producers);
            channel.sendToQueue(
              "producer_created",
              Buffer.from(JSON.stringify(result))
            );
            return res.send(result);
          });

          // update a data to database producers
          app.put("/api/producers/:id", async (req: Request, res: Response) => {
            const producers = await producerRepository.findOneById(
              req.params.id
            );
            producerRepository.merge(producers, req.body);
            const result = await producerRepository.save(producers);
            channel.sendToQueue(
              "producer_updated",
              Buffer.from(JSON.stringify(result))
            );
            return res.send(result);
          });

          // delete a data from database producers
          app.delete(
            "/api/producers/:id",
            async (req: Request, res: Response) => {
              const result = await producerRepository.delete(req.params.id);
              channel.sendToQueue(
                "producer_deleted",
                Buffer.from(JSON.stringify(req.params.id))
              );
              return res.send(result);
            }
          );

          // add a financialamount data to database producers
          app.post(
            "/api/producers/:id/financialamount",
            async (req: Request, res: Response) => {
              const producers = await producerRepository.findOneById(
                req.params.id
              );
              producers.amount = await req.body.amount;
              const result = await producerRepository.save(producers);
              return res.send(result);
            }
          );

          console.log(`listen on port ${port}`);
          app.listen(port);
          process.on("beforeExit", () => {
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
      connection.createChannel((error2, channel2) => {
        if (error2) {
          throw error2;
        }

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

        // get all data from database producers
        app.get("/api/producers", async (req: Request, res: Response) => {
          const producers = await producerRepository.find();
          res.json(producers);
        });

        // get a data from database producers
        app.get("/api/producers/:id", async (req: Request, res: Response) => {
          const producers = await producerRepository.findOneById(req.params.id);
          res.json(producers);
        });

        // add a data to database producers
        app.post("/api/producers", async (req: Request, res: Response) => {
          const producers = await producerRepository.create(req.body);
          const result = await producerRepository.save(producers);
          channel2.sendToQueue("producer_created", Buffer.from(JSON.stringify(result)));
          return res.send(result);
        });

        // update a data to database producers
        app.put("/api/producers/:id", async (req: Request, res: Response) => {
          const producers = await producerRepository.findOneById(req.params.id);
          producerRepository.merge(producers, req.body);
          const result = await producerRepository.save(producers);
          channel2.sendToQueue("producer_updated", Buffer.from(JSON.stringify(result)));
          return res.send(result);
        });

        // delete a data from database producers
        app.delete(
          "/api/producers/:id",
          async (req: Request, res: Response) => {
            const result = await producerRepository.delete(req.params.id);
            channel2.sendToQueue("producer_deleted", Buffer.from(JSON.stringify(req.params.id)));
            return res.send(result);
          }
        );

        // add a financialamount data to database producers
        app.post(
          "/api/producers/:id/financialamount",
          async (req: Request, res: Response) => {
            const producers = await producerRepository.findOneById(
              req.params.id
            );
            producers.amount = await req.body.amount;
            const result = await producerRepository.save(producers);
            return res.send(result);
          }
        );

        console.log(`listen on port ${port}`);
        app.listen(port);
        process.on("beforeExit", () => {
          console.log("closing");
          connection.close();
        });
      });
      ///// end Channel 2
      }
    }
  );
});
