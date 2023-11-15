import React, { useEffect, useState, useContext } from 'react';
import firebaseConfig from './firebaseConfig';
import { userContext } from '/Context';
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth'
import {getFirestore, collection, onSnapshot, doc, getDocs } from "firebase/firestore"
import  LetsBuyCrypto  from '/LetsBuyCrypto';
import  LetsSellCrypto  from '/LetsSellCrypto';
import Logo from '/src/Logo.jpg';


function Crypto(){ 
  
const masterCollection='cryptoCollection'
const theId = 'wrZzk7dZSKOl2rSwHUU4'

function replaceUnderscoreWithDot(str) {
  //console.log("hello")
  return str.replace(/_/g, '.');
}
  
const [loading, setLoading] = useState(true);
const user = useContext(userContext);
const { totalCrypto, setCryptoTotal, userObject } = useContext(userContext);
//console.log(user.userObject.uid)
const uid = userObject.uid
const { setStocksTotal, total } = useContext(userContext);
//console.log(firebaseConfig)
const [lookForStocks, setLookForStocks] = useState(false)
const [dataArray, setDataArray] = useState([])
const [keysArray, setKeysArray] = useState([])
const [items, setItems] = useState([]);
const [buyingStock, setBuyingStock] = useState(false)
const [sellingStock, setSellingStock] = useState(false)
const [dayPlus, setDayPlus] = useState(false)
const [weekPlus, setWeekPlus] = useState(false)
//const [totalStocks, setStocksTotal] = useState(0)

//console.log(dataArray)

const app = initializeApp(firebaseConfig);

const auth = getAuth(app); 
const db = getFirestore(app);
const [stockObject, setStockObject]= useState({})

async function queryStocks(){
  const stocksHeld = collection(db, `users/${uid}/${masterCollection}`)
  return onSnapshot(stocksHeld, snapshot => {
    snapshot.docs.map(doc => setStockObject(doc.data()))
   });
}

//console.log(stockObject)

useEffect(() => {
  queryStocks()
  }, []);


//console.log(loading)
//console.log(keysArray)


async function queryStocksDetails(theArray) {
    let mysteryArray = []
    theArray.length === 0 ? setLoading(false) : setLoading(true)
  const promises = theArray.map((item) => {
    const stockDetails = collection(db, `users/${uid}/${masterCollection}/${theId}/${item}`);
    //console.log(stockDetails)
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
        snapshot.docs.map((doc) => {
          //console.log(doc.data());
          const newThing = doc.data();
          //console.log(newThing.cryptoSymbol)
          newThing.cryptoSymbol ? newThing.cryptoSymbol = replaceUnderscoreWithDot(newThing.cryptoSymbol): null
          mysteryArray.push(newThing)
          //console.log(mysteryArray)
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
              const rawNumber = (this.unitsHeld * this.unitValueToday).toFixed(2);
              const formattedNumber = parseFloat(rawNumber).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  useGrouping: true, // This option adds commas to the thousands place
              });
              return ('$'+formattedNumber);
          },
            unitValueDayChange: 0,
            unitValueWeekChange: 0,    
}));
 setDataArray(updatedArray) 
}


useEffect(() => {
  setKeysArray(Object.keys(stockObject))
}, [stockObject]);
  



//console.log(dataArray)


useEffect(() => {
  if (keysArray.length > 0) {
    queryStocksDetails(keysArray);
    //console.log("when")
  } else if (keysArray.length === 0) {
   setLoading(false)
  }
}, [keysArray.length]);


//console.log(items[0].unitValueToday)


async function fetchUnitValue(y) {
  try {
    //console.log(y.cryptoName)
    const lowerCaseName = y.stockName ? y.stockName.toLowerCase(): null
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${lowerCaseName}`)
    const data = await response.json();
    //console.log(data)
    //console.log(data.market_data.current_price.usd)
    const currentPrice = data.market_data.current_price.usd
    const dayChange = (data.market_data.price_change_percentage_24h).toFixed(2)
    const weekChange = (data.market_data.price_change_percentage_7d).toFixed(2)
    //console.log(currentPrice)
    y.unitValueToday = currentPrice
    y.unitValueDayChange = dayChange
    y.unitValueWeekChange = weekChange
  } catch (error) {
    console.error(`Error updating unitValueToday for ${y.stockName}:`, error);
  }
  //console.log(y)
}

//console.log(dataArray)

async function updateAllFetchedUnitValues(items) {
  const copyItems = [...items];
  for (let i = 0; i < items.length; i++) {
    //console.log(`Updating unitValueToday for ${items[i].stockName}`);
    //console.log(items[i].unitValueToday)
    await fetchUnitValue(copyItems[i]);
  }
  //console.log(items[0].unitValueToday)
  //console.log(copyItems)
  setItems(copyItems);
  setLoading(false); // Set loading to false
}


useEffect(() => {
  if (dataArray.length > 0){
  updateAllFetchedUnitValues(dataArray);
  //console.log(dataArray)
} 
}, [dataArray]);

//console.log(items)
useEffect(() => {
  let emptyArray = []
  if (items.length > 0){
    for (let i = 0; i < items.length; i++) {
  //console.log(items)
  if (items[i].unitValueToday > items[i].unitValueYesterday) {setDayPlus(true)}
  if (items[i].unitValueToday > items[i].unitValueLastWeek) {setWeekPlus(true)}
  const rawItem = items[i].heldValue.slice(1)
  //console.log(typeof rawItem)
  emptyArray.push(rawItem)
}}
const numberArray = emptyArray.map(str => parseFloat(str.replace(/,/g, '')));
const sum = numberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
const formattedNumber = sum.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
setCryptoTotal(formattedNumber)
}, [items]);


function addStock() {
  //console.log("add stock")
  setBuyingStock(true)
}

function sellStock() {
  console.log("sell stock")
  setSellingStock(true)
}
const positiveColor = { color: 'green' };
const negativeColor = { color: 'red' };

if (buyingStock === true) {
  return (
    <LetsBuyCrypto dataArray = {dataArray} />
  )} else if (sellingStock === true) {
    return (
      <LetsSellCrypto dataArray = {dataArray}/>
     )} else {
return  (
  <div>

<div className="banner">
  <button className="home-button" onClick={addStock} >Add Crypto</button>
    <button className="logout-button" onClick={sellStock}>Sell Crypto</button>
</div>

{loading ? (
        <div className = 'daddy'>
          <h1>Loading...</h1>
        </div>
      ) : (
        <div className = 'daddy'>
    <table className = 'theTable'>
      <thead>
        <tr className ='breakdown-row'>
          <th className ='stockNameColumn1'>CRYPTO</th>
          <th className ='stockNameColumn2'>PLATFORM</th>
          <th className ='stockNameColumn3'>VALUE</th>
          <th className ='stockNameColumn4'>DAY</th>
          <th className ='stockNameColumn5'>WEEK</th>
        </tr>
      </thead>
       <tbody>
        {items.map((row, index) => (
          <tr className ='breakdown-row' key={index}>
            <td className ='stockNameColumn1'>{row.stockName}</td>
            <td className ='stockNameColumn2'>{row.platform}</td>
            <td className ='stockNameColumn3'>{row.heldValue}</td>
            <td className ='stockNameColumn4' style = {row.unitValueDayChange> 0 ? positiveColor : negativeColor}>{row.unitValueDayChange}%</td>
            <td className ='stockNameColumn5' style = {row.unitValueWeekChange> 0 ? positiveColor : negativeColor}>{row.unitValueWeekChange}%</td>
          </tr>
        ))}
        <tr className ='breakdown-row'>
          <th className ='totalColumn1'>TOTAL</th>
          <th className ='totalColumn2'>{totalCrypto}</th>
        </tr>
      </tbody>
    </table>
    </div>
      )}
      <img className = 'logoSignIn' src={Logo} alt="Logo" />
    </div>
  ) 
}
  }

export default Crypto;
