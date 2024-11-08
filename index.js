const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require('redis');
const cors = require("cors")
const RedisStore = require("connect-redis").default;

const { 
    MONGO_USER, 
    MONGO_PASSWORD, 
    MONGO_IP, 
    MONGO_PORT,
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET
} = require("./config/config");

// Create a Redis client
let redisClient = redis.createClient({
    socket: {
      host: REDIS_URL,
      port: REDIS_PORT
    },
})
redisClient.connect().catch(console.error)

let redisStore = new RedisStore({
    client: redisClient
})

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose
        .connect(mongoURL)
        .then(() => console.log("Successfully connected to MongoDB"))
        .catch((e) => {
            console.log(e);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}));
app.use(
    session({
      store: redisStore,
      secret: SESSION_SECRET,
      cookie: {
        secure: false,
        resave: false,
        httpOnly: true,
        saveUninitialized: false,
        maxAge: 30000
      }    
    })
  )

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h2>HI THERE</h2>");
    console.log("yeah, it worked")
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
