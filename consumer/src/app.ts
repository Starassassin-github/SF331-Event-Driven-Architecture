import * as express from "express";
import * as cors from "cors";
import * as amqp from "amqplib/callback_api";

const port = 8001;
try {
  amqp.connect(
    "amqps://vwiugkgc:0s7MKslaqAl55plx6eF5M35weZyuo103@armadillo.rmq.cloudamqp.com/vwiugkgc",
    (errorConnection, connection) => {
      if (errorConnection) {
        throw errorConnection;
      }

      connection.createChannel((error, channel) => {
        if (error) {
          throw error;
        }

        channel.assertQueue("producer_created", { durable: false });
        channel.assertQueue("producer_updated", { durable: false });
        channel.assertQueue("producer_deleted", { durable: false });

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

        channel.consume(
          "producer_created",
          (msg) => {
            const eventProducer = JSON.parse(msg.content.toString());
            console.log("producer_created", eventProducer);
          },
          { noAck: true }
        );

        channel.consume(
          "producer_updated",
          (msg) => {
            const eventProducer = JSON.parse(msg.content.toString());
            console.log("producer_updated", eventProducer);
          },
          { noAck: true }
        );

        channel.consume(
          "producer_deleted",
          (msg) => {
            const eventProducer = JSON.parse(msg.content.toString());
            console.log("producer_deleted id:", eventProducer);
          },
          { noAck: true }
        );

        console.log(`listen on port ${port}`);
        app.listen(port);
        process.on("beforeExit", () => {
          console.log("closing");
          connection.close();
        });
      });
    }
  );
} catch (error) {
  console.log(error);
}
