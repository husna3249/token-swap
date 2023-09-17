const express = require("express");
const Moralis = require("moralis").default;// Moralis SDK for blockchain integration
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());// Use CORS middleware to handle cross-origin requests
app.use(express.json());// Parse incoming request bodies as JSON


app.get("/tokenPrice", async (req, res) => {
  try {
  // Retrieve token addresses from query parameters or use default values
    const addressOne = req.query.addressOne || "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const addressTwo = req.query.addressTwo || "'0x514910771af9ca656af840dff83e8264ecf986ca";

  
    console.log("Address One:", addressOne);
    console.log("Address Two:", addressTwo);

    // Fetch the token prices from Moralis for the provided addresses
    const responseOne = await Moralis.EvmApi.token.getTokenPrice({
      address: addressOne
    });
    const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
      address: addressTwo
    });

     const usdPrices={
      tokenOne :  responseOne.raw.usdPrice,
      tokenTwo : responseTwo.raw.usdPrice,
      ratio :responseOne.raw.usdPrice/responseTwo.raw.usdPrice
     }

    // Returning the token prices
    return res.status(200).json(usdPrices);

  } catch (error) {
    console.error("Error fetching token prices:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls on port ${port}`);
  });
});
