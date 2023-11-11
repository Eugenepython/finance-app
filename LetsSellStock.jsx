import React, { useEffect, useContext } from "react";
import {useState} from 'react';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth'
import {getFirestore, collection, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { userContext } from '/Context';


function LetsSellStock({dataArray}) {

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);
const user = useContext(userContext);
const uid = user.userObject.uid
const [value, setValue] = useState('');
const [destinationStock, setDestinationStock] = useState(null)
const theArray = ['tesla', 'github', 'hoover']
const [newStock, setNewStock] = useState(false)
const [existingStock, setExistingStock] = useState(true)
const [matchingStock, setMatchingStock] = useState(false)
const [stockNames, setStockNames] = useState([])
const [showingAmountToAdd, setShowingAmountToAdd] = useState(false)
const [valueAddExist, setValueAddExist] = useState('');
const [amountToSubtract, setAmountToSubtract] = useState(0)
const [showFinal, setShowFinal] = useState(false)
const [oldValue, setOldValue] = useState(0)
const [showNewValue, setShowNewValue] = useState(false)
const [newValue, setNewValue] = useState(0)
const [noTrade, showNoTrade] = useState(false)
let singleArray = [destinationStock]


async function fetchStockData(destinationStock) {
  const stockRef = doc(db, `users/${uid}/stocks/ClZGlMuH1YdA9tGzp2tT/${destinationStock}`);
  
  try {
    const stockSnapshot = await getDoc(stockRef);

    if (stockSnapshot.exists()) {
      // Access the data including the unique identifier
      const stockData = stockSnapshot.data();
      const uniqueIdentifier = stockData.uniqueIdentifier; // Replace with the actual field name

      return { uniqueIdentifier, ...stockData };
    } else {
      console.log("Document does not exist");
      return null;
    }
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
}

const [noTradeMessage, setNoTradeMessage] = useState('')
const [elusiveDocumentID, setElusiveDocumentID] = useState('')
const [theNewTotal, setTheNewTotal] = useState(0)

function confirmAmountExistingSubtract(event) {
  event.preventDefault(); 
  //console.log(valueAddExist)
  
  let numberToSell = parseFloat(valueAddExist)
  if (isNaN(numberToSell)) {numberToSell = 0}
  const roundedNumberToSell = Number(numberToSell.toFixed(3))
  const newNumber = oldValue - roundedNumberToSell
  setTheNewTotal(newNumber)
  if (newNumber < 0) {
    //showNoTrade(true)
    setNoTradeMessage("You cannot sell more than you own")
    setShowFinal(false)
  } else {
    setNewValue(newNumber)
  
  setAmountToSubtract(roundedNumberToSell)
  //console.log(valueAddExist)
  setShowFinal(true)
  setNewStock(true)
  setShowingAmountToAdd(false)
  setExistingStock(false)
  setNoTradeMessage("")
  }
}

function changeInputAddExist(event) {
 // console.log(event.target.value)
  setValueAddExist(event.target.value)
}


function handleSubmit(event) {
    event.preventDefault();
    setDestinationStock(value)
    //console.log(value)
    setValue('');
    setExistingStock(false)
    setShowingAmountToAdd(true)
    singleArray = [value]
    console.log(singleArray)
    queryStocksDetails(singleArray)
  }

  useEffect(() => {
  let emptyStocks = []
  for(let i = 0; i < dataArray.length; i++) {
    //console.log(dataArray[i].stockName)
    const stockName = dataArray[i].stockName
    const lowStockName = stockName.toLowerCase()
    emptyStocks.push(lowStockName)
    //console.log(emptyStocks)
    setStockNames(emptyStocks)
  }
  }, [dataArray]);
//console.log(stockNames)
  function handleInputChange(event) {
    //console.log(event.target.value);
    setValue(event.target.value)
    const lowerCaseValue = event.target.value.toLowerCase()
    if (stockNames.includes(lowerCaseValue)) {
           setMatchingStock(true)
  } else {
    setMatchingStock(false)
  }
}




async function queryStocksDetails(theArray) {
  const cappedArray = []
  for (let i=0; i < theArray.length; i++) {
    const eachItem = theArray[i]
    const capppedItem = eachItem.charAt(0).toUpperCase() + eachItem.slice(1).toLowerCase()
    cappedArray.push(capppedItem)
  }
const promises = cappedArray.map((item) => {
  const stockDetails = collection(db, `users/${uid}/stocks/ClZGlMuH1YdA9tGzp2tT/${item}`);
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
        snapshot.docs.forEach((y) => {
          const subCollection = y.data();
          //console.log(subCollection.unitsHeld)
          const theElusiveDocumentID = y.id;
          setElusiveDocumentID(theElusiveDocumentID)
           const theOldValue = subCollection.unitsHeld
           setOldValue(theOldValue)
      });
      unsubscribe(); // Unsubscribe from the listener
      resolve(); // Resolve the promise
    }, (error) => {
      console.error('Error fetching data:', error);
  });
  });
});
await Promise.all(promises);
}

function updateStocksDetails(stock) {
  const cappedStock = stock.charAt(0).toUpperCase() + stock.slice(1).toLowerCase()
  const refStock = doc(db, `users/${uid}/stocks/ClZGlMuH1YdA9tGzp2tT/${cappedStock}/${elusiveDocumentID}`); 
  updateDoc(refStock, { unitsHeld: theNewTotal });
}


function getStockDetails() {
    updateStocksDetails(singleArray[0])
    //console.log(singleArray[0])
    setShowFinal(false)
    setShowNewValue(true)
  //console.log(singleArray)
  // g back to the home page
}

function backToStock(){
  //console.log("hello")
  setShowFinal(false)
  showNoTrade(true)
}



//console.log(dataArray[0].stockName)
  return (
    <div>
      <h1>Lets Sell Stock</h1>
      
  
    {existingStock && !showingAmountToAdd && (
      <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={value}
              onChange={handleInputChange}
            />
          </div>
                <button className = 'submitStockButton'
                style={matchingStock ? { display: 'block' } : { display: 'none' }}
                type="submit"
                >
                Submit
                </button>
          </form>
         )}
          {showingAmountToAdd && (
            <div>
              <div>You have {oldValue} shares in {destinationStock}</div>
            <p>{value}</p>
            <form onSubmit={confirmAmountExistingSubtract}>
            <div>
            <label htmlFor="name">Amount of shares sold:</label>
            <input
              type="number"
              value={valueAddExist}
              onChange={changeInputAddExist}
            />
            </div>
            <button 
              className = 'submitStockButton'
              type="submit"
            >
            Submit Amount
            </button>
            </form>
            {noTradeMessage}
            </div>
          )}

          {showFinal && (
            <div>
              <p>{value}</p>
              <p>{amountToSubtract}</p>
              <p>Are you sure you want to sell {amountToSubtract} of {destinationStock}?</p>
              <button onClick = {getStockDetails}>Yes</button>
              <button onClick ={backToStock}>No</button>
              <p>{noTradeMessage}</p>
            </div>
          )}
          {showNewValue && (
            <div>
            <p>You now have {newValue} shares of {destinationStock}   </p>
            </div>
          )}
          {noTrade && (
            <div>
              <p>No trade, click Home</p>
            </div>
          )}
    </div>
  );
}



export default LetsSellStock;

/// setShowFinal(false)

