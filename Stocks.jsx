import React, { useEffect, useState, useContext } from 'react';
import firebaseConfig from './firebaseConfig';
import { userContext } from '/Context';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, onSnapshot, doc, getDocs } from "firebase/firestore"
import LetsBuyStock from '/LetsBuyStock';
import LetsSellStock from '/LetsSellStock';
import Logo from '/src/Logo.jpg';



function Stocks() {

  const masterCollection = 'rightStocks'
  const theId = 'QKjEqBTHxMEU1VEPzh2p'
  function replaceUnderscoreWithDot(str) {
    return str.replace(/_/g, '.');
  }

  const [loading, setLoading] = useState(true);
  const user = useContext(userContext);
  //const { setStocksTotal, totalStocks, userObject } = useContext(userContext);
  //console.log(user.userObject.uid)
  const uid = user.userObject.uid
  const { setStocksTotal, totalStocks } = useContext(userContext);
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


  useEffect(() => {
    queryStocks()
  }, []);




  async function queryStocksDetails(theArray) {
    let mysteryArray = []
    //console.log(theArray)
    theArray.length === 0 ? setLoading(false) : setLoading(true)
    const promises = theArray.map((item) => {
      const stockDetails = collection(db, `users/${uid}/${masterCollection}/${theId}/${item}`);
      //console.log(stockDetails)
      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
          snapshot.docs.map((doc) => {
            //console.log(doc.data());
            const newThing = doc.data();
            //console.log(newThing.stockName)
            newThing.stockName = replaceUnderscoreWithDot(newThing.stockName);
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
      unitValueYesterday: 0,
      unitValueLastWeek: 0,
      get unitValueDayChange() {
        if (this.unitValueYesterday !== 0) {
          const theNumber = (this.unitValueToday - this.unitValueYesterday) / this.unitValueYesterday;
          //console.log(theNumber)
          const roundedNumber = ((theNumber * 100).toFixed(1))
          //if (roundedNumber >0) {setDayPlus(true)} else { setDayPlus(false)} 
          return roundedNumber;
        } else {
          return 0;
        }
      },
      get unitValueWeekChange() {
        if (this.unitValueLastWeek !== 0) {
          const theNumber = (this.unitValueToday - this.unitValueLastWeek) / this.unitValueLastWeek
          const roundedNumber = ((theNumber * 100).toFixed(1))
          //if (roundedNumber >0) {setWeekPlus(true)} else { setWeekPlus(false)} 
          return roundedNumber;
        } else {
          return 0;
        }
      },
    }));
    setDataArray(updatedArray)
  }

  //console.log(dataArray)
  const pluralArray = ['github', 'apple', 'pear']

  //console.log(loading)
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
    const apiKey = 'cl8aoi9r01qqqm023ln0cl8aoi9r01qqqm023lng'
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${y.stockSymbol}&token=${apiKey}`);
      const data = await response.json();
      console.log(data)
      //console.log(data.c)
      //console.log(data.pc)
      const currentPrice = data.c;
      const yesterPrice = data.pc
      y.unitValueToday = currentPrice
      y.unitValueYesterday = yesterPrice
    } catch (error) {
      console.error(`Error updating unitValueToday for ${y.stockName}:`, error);
    }
    //console.log('Response Status:', response.status);
    //const data = await response.json();
    //console.log(data.c[0])
    //const weekAgoPrice = data.c[0]
    console.log("three")
    //console.log(y)
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
    setLoading(false);
    console.log("two")
  }

  //console.log(dataArray)
  useEffect(() => {
    if (dataArray.length > 0) {
      updateAllFetchedUnitValues(dataArray);

    }
  }, [dataArray]);


  useEffect(() => {
    let emptyArray = []
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        //console.log(items)
        if (items[i].unitValueToday > items[i].unitValueYesterday) { setDayPlus(true) }
        if (items[i].unitValueToday > items[i].unitValueLastWeek) { setWeekPlus(true) }
        const rawItem = items[i].heldValue.slice(1)
        //console.log(typeof rawItem)
        emptyArray.push(rawItem)
      }
    }
    const numberArray = emptyArray.map(str => parseFloat(str.replace(/,/g, '')));
    const sum = numberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const formattedNumber = sum.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    setStocksTotal(formattedNumber)
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
      <LetsBuyStock dataArray={dataArray} />
    )
  } else if (sellingStock === true) {
    return (
      <LetsSellStock dataArray={dataArray} />
    )
  } else {
    return (
      <div>

        <div className="banner">
          <button className="home-button" onClick={addStock} >Add Stock</button>
          <button className="logout-button" onClick={sellStock}>Sell Stock</button>
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
                    <th className='stockNameColumn1'>STOCKS</th>
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
                      {/* <td className='stockNameColumn5' style={row.unitValueWeekChange > 0 ? positiveColor : negativeColor}>{row.unitValueWeekChange}%</td> */}
                      <td className='stockNameColumn5' style={row.unitValueWeekChange > 0 ? positiveColor : negativeColor}>N/A</td>

                    </tr>
                  ))}
                  <tr className='breakdown-row'>
                    <th className='totalColumn1'>TOTAL</th>
                    <th className='totalColumn2'>{totalStocks}</th>
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

export default Stocks;
