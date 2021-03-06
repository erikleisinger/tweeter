"use strict";

const userHelper = require("../lib/util/user-helper");

const express = require("express");
const { generateRandomUser } = require("../lib/util/user-helper");
const tweetsRoutes = express.Router();

const database = require("../pool");

module.exports = function (DataHelpers) {
  tweetsRoutes.get("/", async function (req, res) {
    const data = [];

    const tweets_db = DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        return tweets;
      }
    })

    const retweets_db = DataHelpers.getRetweets((err, retweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        return retweets
      }
    });

    const user_likes = DataHelpers.getLikes((err, likes) => {

      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        return likes
      }
    })

    const user_retweets = DataHelpers.getUserRetweets((err, retweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        return retweets
      }
    })

    Promise.all([tweets_db, retweets_db, user_likes, user_retweets]).then((data) => {
      const allTweets = data[0].concat(data[1]).sort((a, b) => a.created_at - b.created_at)

      const likes = data[2].reduce((acc, current) => {
        return [...acc, current.tweet_id]
      }, [])
      console.log('data 3:', data[3])
      const retweets = data[3].reduce((acc, current) => {
        return [...acc, current.tweet_id]
      }, [])

      console.log(retweets)

      const user_data = {
        tweets: allTweets,
        likes,
        retweets
      }
      
      res.send(user_data)
    })

  });

  tweetsRoutes.post("/", function (req, res) {
    if (!req.body.text) {
      res.status(400).json({ error: "invalid request: no data in POST body" });
      return;
    }

    const user = req.body.user
      ? req.body.user
      : userHelper.generateRandomUser();
    const id = Math.floor(Math.random() * 1000000).toString();

    const tweet = {
      user: user,
      content: {
        text: req.body.text,
      },
      id: id,
      original: id,
      created_at: Date.now(),
      liked: false,
      retweets: 0,
    };

    DataHelpers.saveTweet(tweet, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).send(tweet);
      }
    });
  });

  tweetsRoutes.post("/:id/like", function (req, res) {
    DataHelpers.likeTweet(req.params.id, (err, liked) => {
      console.log(liked)
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).send(liked);
      }
    });
  });

  tweetsRoutes.post("/:id/retweet", function (req, res) {
    DataHelpers.retweet(req.params.id, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).send('done');
      }
    });
  });

  return tweetsRoutes;
};
