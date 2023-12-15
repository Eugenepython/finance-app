import React, { useEffect, useState, useContext } from 'react';
import firebaseConfig from './firebaseConfig';
import { userContext } from '/Context';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, onSnapshot, doc, getDocs } from "firebase/firestore"
import LetsBuyCrypto from '/LetsBuyCrypto';
import LetsSellCrypto from '/LetsSellCrypto';
import Logo from '/src/Logo.jpg';


function Crypto() {

  const masterCollection = 'cryptoCollection'
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
  const [stockObject, setStockObject] = useState({})

  async function queryStocks() {
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
            newThing.cryptoSymbol ? newThing.cryptoSymbol = replaceUnderscoreWithDot(newThing.cryptoSymbol) : null
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
      unitValueToday: 0,
      get heldValue() {
        const rawNumber = (this.unitsHeld * this.unitValueToday).toFixed(2);
        const formattedNumber = parseFloat(rawNumber).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true, // This option adds commas to the thousands place
        });
        return ('$' + formattedNumber);
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




  async function fetchBatchUnitValues(cryptoNames) {
    console.log('Fetching data for crypto names:', cryptoNames);
    try {
      const currentDate = new Date();
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const historicalPricesResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoNames.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d`
      );
      if (!historicalPricesResponse.ok) {
        throw new Error(`Failed to fetch historical prices. Status: ${historicalPricesResponse.status} ${historicalPricesResponse.statusText}`);
      }
      const historicalPricesData = await historicalPricesResponse.json();
      // console.log('Historical Prices Data:', historicalPricesData);
      const updatedData = await Promise.all(cryptoNames.map(async (cryptoName) => {
        try {
          const lowerCaseName = cryptoName.toLowerCase();
          const cryptoEntry = historicalPricesData.find(entry => entry.id === lowerCaseName || entry.symbol === lowerCaseName);
          // console.log('Crypto Name:', cryptoName);
          // console.log('Crypto Entry:', cryptoEntry);
          // console.log('day % change: ' + cryptoEntry.price_change_percentage_24h);
          // console.log('week % change: ' + cryptoEntry.price_change_percentage_7d_in_currency);
          // console.log('current price: ' + cryptoEntry.current_price);

          return {
            cryptoName,
            currentPrice: cryptoEntry.current_price,
            yesterdayPriceChange: cryptoEntry.current_price / (1 + (cryptoEntry.price_change_percentage_24h / 100)),
            lastWeekPriceChange: cryptoEntry.current_price / (1 + (cryptoEntry.price_change_percentage_7d_in_currency / 100)),
          };
        } catch (error) {
          console.error('Error fetching crypto data:', error);
          return null;
        }
      }));
      console.log(updatedData)
      return updatedData; // Return the data after the Promise.all is complete
    } catch (error) {
      console.error('Outer try-catch block error:', error);
      return null; // Handle the error or return a default value
    }
  }



  // Function to update items with fetched data
  async function updateAllFetchedUnitValues(items) {
    const copyItems = [...items];
    const cryptoNames = copyItems.map(item => item.stockName.toLowerCase());
    console.log('Crypto Names:', cryptoNames);
    console.log(copyItems)
    try {
      const data = await fetchBatchUnitValues(cryptoNames);
      console.log(data);
      copyItems.forEach(item => {
        const lowerCaseName = item.stockName.toLowerCase();
        console.log(lowerCaseName)
        //const cryptoData = data[lowerCaseName];
        const cryptoData = data.find(entry => entry.cryptoName.toLowerCase() === lowerCaseName.toLowerCase());
        console.log(cryptoData)
        if (cryptoData) {
          item.unitValueToday = cryptoData.currentPrice;
          item.unitValueDayChange = ((cryptoData.currentPrice - cryptoData.yesterdayPriceChange) / cryptoData.yesterdayPriceChange * 100).toFixed(2);
          item.unitValueWeekChange = ((cryptoData.currentPrice - cryptoData.lastWeekPriceChange) / cryptoData.lastWeekPriceChange * 100).toFixed(2);
          //item.unitValueYesterday = cryptoData.yesterdayPrice;
          //item.unitValueLastWeek = cryptoData.lastWeekPrice;
          // Additional properties if needed
        }
      });
      setItems(copyItems);
      setLoading(false);
      console.log(copyItems)
    } catch (error) {
      console.error('Error updating unit values for crypto:', error);
      setLoading(false);
    }
  }



  useEffect(() => {
    if (dataArray.length > 0) {
      updateAllFetchedUnitValues(dataArray);
    }
  }, [dataArray]);


  //console.log(items)
  useEffect(() => {
    let emptyArray = []
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        //console.log(items)
        //if (items[i].unitValueToday > items[i].unitValueYesterday) { setDayPlus(true) }
        //if (items[i].unitValueToday > items[i].unitValueLastWeek) { setWeekPlus(true) }
        if (items[i].unitValueDayChange > 0) { setDayPlus(true) }
        if (items[i].unitValueWeekChange > 0) { setWeekPlus(true) }
        const rawItem = items[i].heldValue.slice(1)
        //console.log(typeof rawItem)
        emptyArray.push(rawItem)
      }
    }
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
      <LetsBuyCrypto dataArray={dataArray} />
    )
  } else if (sellingStock === true) {
    return (
      <LetsSellCrypto dataArray={dataArray} />
    )
  } else {
    return (
      <div>

        <div className="banner">
          <button className="home-button" onClick={addStock} >Add Crypto</button>
          <button className="logout-button" onClick={sellStock}>Sell Crypto</button>
        </div>

        {loading ? (
          <div className='daddy'>
            <h1>Loading...</h1>
          </div>
        ) : (
          <div className='daddy'>
            <div className="table-container">

              <table className='theTable'>

                <thead>
                  <tr className='breakdown-row'>
                    <th className='stockNameColumn1'>CRYPTO</th>
                    <th className='stockNameColumn2'>PLATFORM</th>
                    <th className='stockNameColumn3'>VALUE</th>
                    <th className='stockNameColumn4'>DAY</th>
                    <th className='stockNameColumn5'>WEEK</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, index) => (
                    <tr className='breakdown-row' key={index}>
                      <td className='stockNameColumn1'>{row.stockName}</td>
                      <td className='stockNameColumn2'>{row.platform}</td>
                      <td className='stockNameColumn3'>{row.heldValue}</td>
                      <td className='stockNameColumn4' style={row.unitValueDayChange > 0 ? positiveColor : negativeColor}>{row.unitValueDayChange}%</td>
                      <td className='stockNameColumn5' style={row.unitValueWeekChange > 0 ? positiveColor : negativeColor}>{row.unitValueWeekChange}%</td>
                    </tr>
                  ))}
                  <tr className='breakdown-row'>
                    <th className='totalColumn1'>TOTAL</th>
                    <th className='totalColumn2'>{totalCrypto}</th>
                  </tr>
                </tbody>
              </table>
              <br />
              <br />
              <br />
              <br />
            </div>
          </div>

        )}
        <img className='cryptoStocksLogo' src={Logo} alt="Logo" />
        <p className='bottomTitle'>Rubrikal</p>
      </div>
    )
  }
}

export default Crypto;
