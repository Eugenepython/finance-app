import React, { useEffect, useState, useContext } from 'react';
import firebaseConfig from './firebaseConfig';
import { userContext } from '/Context';
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth'
import {getFirestore, collection, onSnapshot, doc, getDocs } from "firebase/firestore"
import  LetsBuyStock  from '/LetsBuyStock';
import  LetsSellStock  from '/LetsSellStock';


function Stocks() {  
  
const [loading, setLoading] = useState(true);
const user = useContext(userContext);
//console.log(user.userObject.uid)
const uid = user.userObject.uid
//console.log(firebaseConfig)
const [lookForStocks, setLookForStocks] = useState(false)
const [dataArray, setDataArray] = useState([])
const [keysArray, setKeysArray] = useState([])
const [items, setItems] = useState([]);
const [buyingStock, setBuyingStock] = useState(false)
const [sellingStock, setSellingStock] = useState(false)

//console.log(dataArray)

const app = initializeApp(firebaseConfig);

const auth = getAuth(app); 
const db = getFirestore(app);
const [stockObject, setStockObject]= useState({})

async function queryStocks(){
  const stocksHeld = collection(db, `users/${uid}/stocks`)
  return onSnapshot(stocksHeld, snapshot => {
    snapshot.docs.map(doc => setStockObject(doc.data()))
   });
}


useEffect(() => {
  queryStocks()
  }, []);




async function queryStocksDetails(theArray) {
    let mysteryArray = []
  const promises = theArray.map((item) => {
    const stockDetails = collection(db, `users/${uid}/stocks/ClZGlMuH1YdA9tGzp2tT/${item}`);
    //console.log(stockDetails)
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
        snapshot.docs.map((doc) => {
          //console.log(doc.data());
          const newThing = doc.data();
          mysteryArray.push(newThing)
        });
        unsubscribe(); // Unsubscribe from the listener
        resolve(); // Resolve the promise
      });
    });
  });
  await Promise.all(promises);
  const updatedArray = mysteryArray.map((item) => ({
  ...item, // Spread the original key-value pairs
            unitValueToday : 0,
            get heldValue() { 
              const rawNumber = (this.unitsHeld * this.unitValueToday).toFixed(0);
              const formattedNumber = parseFloat(rawNumber).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  useGrouping: true, // This option adds commas to the thousands place
              });
              return ('£'+formattedNumber);
          },
            unitValueYesterday: 0,
            unitValueLastWeek: 0,
            get unitValueDayChange(){ 
            if (this.unitValueYesterday !== 0) {
            const theNumber = (this.unitValueToday - this.unitValueYesterday)/this.unitValueYesterday;
            const roundedNumber = theNumber.toFixed(1);
            return roundedNumber;
            } else {
            return 0; 
            }
            },
            get unitValueWeekChange(){
            if (this.unitValueLastWeek !== 0) {
            const theNumber = (this.unitValueToday - this.unitValueLastWeek)/this.unitValueLastWeek
            const roundedNumber = theNumber.toFixed(1);
            return roundedNumber;
            } else {
            return 0; 
            }
            },
}));
 setDataArray(updatedArray) 
}


const pluralArray = ['github', 'apple', 'pear']


useEffect(() => {
  setKeysArray(Object.keys(stockObject))
}, [stockObject]);
  



//console.log(dataArray)


useEffect(() => {
  if (keysArray.length > 0) {
    queryStocksDetails(keysArray);
  }
}, [keysArray.length]);


//console.log(items[0].unitValueToday)


async function fetchUnitValue(y) {
  const apiKey = 'Y0A5NE0HBCFDHFRQ';
  //const stockSymbol = y.stockName;
  try {
    //const fetchTimeSeries = async (functionType, interval) => {
      //const response = await fetch(`https://www.alphavantage.co/query?function=${functionType}&symbol=${stockSymbol}&interval=${interval}&apikey=${apiKey}`);
    //  const data = await response.json();
    //  return data;
    //};
    //const fetchCurrentPrice = async () => {
    //  const data = await fetchTimeSeries('GLOBAL_QUOTE', ''); // For daily data, use 'TIME_SERIES_DAILY'
    //  const currentPrice = data['Global Quote']['05. price']; // Adjust the key based on the data structure
    //  console.log(`Current price: $${currentPrice}`);
    //  return parseFloat(currentPrice);
    //};
    //const fetchYesterdayClosingPrice = async () => {
    //  const data = await fetchTimeSeries('TIME_SERIES_DAILY', '1d');
    //  const dates = Object.keys(data['Time Series (Daily)']);
    //  const yesterday = dates[1]; // Assuming data is ordered with the most recent date first
    //  const yesterdayClosingPrice = data['Time Series (Daily)'][yesterday]['4. close'];
    //  console.log(`Yesterday's closing price: $${yesterdayClosingPrice}`);
    //  return parseFloat(yesterdayClosingPrice);
    //};
    //const fetchPriceSevenDaysAgo = async () => {
    //  const data = await fetchTimeSeries('TIME_SERIES_DAILY', '7d');
    //  const dates = Object.keys(data['Time Series (Daily)']);
    //  const sevenDaysAgo = dates[6];
    //  const priceSevenDaysAgo = data['Time Series (Daily)'][sevenDaysAgo]['4. close'];
    //  console.log(`Price 7 days ago: $${priceSevenDaysAgo}`);
    //  return parseFloat(priceSevenDaysAgo);
    //};
    //(async () => {
    //  const currentPrice = await fetchCurrentPrice();
    //  const yesterdayClosingPrice = await fetchYesterdayClosingPrice();
    //  const priceSevenDaysAgo = await fetchPriceSevenDaysAgo();
    //})();



    //const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=5min&apikey=${apiKey}`
    //);
    
    //const data = await response.json();
    //console.log(data)
     //const thePrice = data['Time Series (5min)'][Object.keys(data['Time Series (5min)'])[0]]['1. open'];
     //console.log(thePrice)
    //const latestPrice = parseFloat(thePrice).toFixed(2);
    const apikey = 'db11493d'
    const response = await fetch(`http://www.omdbapi.com/?apikey=${apikey}&t=${y.stockName}}`);
    const data = await response.json();
    //console.log(data)
    const latestPrice = parseInt(data.Year);
    const yesterPrice = parseInt(data.imdbRating);
    const weekPrice = parseInt(data.Metascore);
    y.unitValueToday = latestPrice;
    y.unitValueYesterday = yesterPrice;
    y.unitValueLastWeek = weekPrice;
    //console.log(y.unitValueToday)
    //console.log(`Updated unitValueToday for ${y.stockName} to ${y.unitValueToday}`);
  } catch (error) {
    console.error(`Error updating unitValueToday for ${y.stockName}:`, error);
  }
  setLoading(false); // Set loading to false
}


async function updateAllFetchedUnitValues(items) {
  const copyItems = [...items];
  for (let i = 0; i < items.length; i++) {
    //console.log(`Updating unitValueToday for ${items[i].stockName}`);
    //console.log(items[i].unitValueToday)
    await fetchUnitValue(copyItems[i]);
    //await fetchUnitValue(items[i]);
  }
  //console.log(items[0].unitValueToday)
  setItems(copyItems);
  setLoading(false); // Set loading to false
}


useEffect(() => {
  if (dataArray.length > 0){
  updateAllFetchedUnitValues(dataArray);
  //console.log("dataArray must be full")
}
}, [dataArray]);
//this fetchingfunction needs to occur after the data has been rtried from the database, not before.



function addStock() {
  //console.log("add stock")
  setBuyingStock(true)
}

function sellStock() {
  console.log("sell stock")
  setSellingStock(true)
}


//console.log(buyingStock)
//console.log(loading)


if (buyingStock === true) {
  return (
    <LetsBuyStock dataArray = {dataArray} />
  )} else if (sellingStock === true) {
    return (
      <LetsSellStock dataArray = {dataArray}/>
     )} else {
      
return  (
  <div>


<div className="banner">
  <button className="home-button" onClick={addStock} >Add Stock</button>
    <button className="logout-button" onClick={sellStock}>Sell Stock</button>
</div>

{loading ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : (
    <table>
      <thead>
        <tr>
          <th>Stocks</th>
          <th>Platform</th>
          <th>Value</th>
          <th>Day</th>
          <th>Week</th>
        </tr>
      </thead>
       <tbody>
        {items.map((row, index) => (
          <tr key={index}>
            <td>{row.stockName}</td>
            <td>{row.platform}</td>
            <td>{row.heldValue}</td>
            <td>{row.unitValueDayChange}%</td>
            <td>{row.unitValueWeekChange}%</td>
          </tr>
        ))}
      </tbody>

    </table>
      )}
    </div>
  ) 
}
  }

export default Stocks;


