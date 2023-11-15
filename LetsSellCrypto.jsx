import React, { useEffect, useContext } from "react";
import {useState} from 'react';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth'
import {getFirestore, collection, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { userContext } from '/Context';
import sell from '/src/sell.jpg';


function LetsSellCrypto({dataArray}) {


  const masterCollection='cryptoCollection'
const theId = 'wrZzk7dZSKOl2rSwHUU4'

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);
const user = useContext(userContext);
const uid = user.userObject.uid
const [value, setValue] = useState('');
const [destinationStock, setDestinationStock] = useState(null)

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

const [unitType, setUnitType] = useState('')


async function fetchStockData(destinationStock) {
  const stockRef = doc(db, `users/${uid}/${masterCollection}/${theId}/${destinationStock}`);
  
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
  let newNumber = oldValue - roundedNumberToSell
  setTheNewTotal(newNumber)
  if (newNumber < 0) {
    //showNoTrade(true)
    setNoTradeMessage("You cannot sell more than you own")
    setShowFinal(false)
  } else {
    newNumber = Number(newNumber.toFixed(3))
    console.log(typeof newNumber)
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


//function handleSubmit(event) {
//    event.preventDefault();
 //   setDestinationStock(value)
    //console.log(value)
  //  setValue('');
  //  setExistingStock(false)
  //  setShowingAmountToAdd(true)
  //  singleArray = [value]
  //  console.log(singleArray)
  //  queryStocksDetails(singleArray)
 // }
  


  function handleSubmit(event) {
    event.preventDefault();
    //console.log('You clicked submit.');
    let capitalString = value.toUpperCase();
    console.log(capitalString)
    singleArray = [capitalString]
    setDestinationStock(capitalString)
    setValue('');
    setExistingStock(false)
    setShowingAmountToAdd(true)
    console.log(singleArray)
    queryStocksDetails(singleArray)
  }
console.log(destinationStock)

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

function handleInputChange(event) { //console.log(event.target.value);
  setValue(event.target.value)
for(let i = 0; i < dataArray.length; i++) {  
const firstThree = dataArray[i].stockName.substring(0, 3)
const firstThreeLower = firstThree.toLowerCase()
const firstThreeLowerThree = firstThreeLower.substring(0, 3)
const firstThreeCapped = firstThreeLowerThree.charAt(0).toUpperCase() + firstThreeLowerThree.slice(1).toLowerCase()
const firstThreeCappedThree = firstThreeCapped.substring(0, 3)
if (firstThree === event.target.value || firstThreeLower === event.target.value || firstThreeLowerThree === event.target.value || firstThreeCapped === event.target.value || firstThreeCappedThree === event.target.value) {
  //console.log("match")
  setValue(dataArray[i].stockName)
  setMatchingStock(true)
  console.log(matchingStock)
}
if (event.nativeEvent.inputType === 'deleteContentBackward') {
  setValue('');
  setMatchingStock(false)
  return;
}
}
  const lowerCaseValue = event.target.value.toLowerCase()
  if (stockNames.includes(lowerCaseValue)) {
         setMatchingStock(true)
} else {
  //setMatchingStock(false)
}
}


async function queryStocksDetails(theArray) {
  const cappedArray = []
  for (let i=0; i < theArray.length; i++) {
   const eachItem = theArray[i]
  const capppedItem = eachItem.replace(/\./g, '_');
    cappedArray.push(capppedItem)
  }
  console.log(cappedArray)
const promises = cappedArray.map((item) => {
  const stockDetails = collection(db, `users/${uid}/${masterCollection}/${theId}/${item}`);
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
        snapshot.docs.forEach((y) => {
          const subCollection = y.data();
          console.log(subCollection.unitsHeld)
          console.log(subCollection.unitName)
          setUnitType(subCollection.unitName)
          const theElusiveDocumentID = y.id;
          setElusiveDocumentID(theElusiveDocumentID)
           const theOldValue = subCollection.unitsHeld
           const cleanOldValue = Number(theOldValue.toFixed(3))
           setOldValue(cleanOldValue)
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
  console.log(stock)
  const cappedItem = stock.replace(/\./g, '_');
  console.log(cappedItem)
  const refStock = doc(db, `users/${uid}/${masterCollection}/${theId}/${cappedItem}/${elusiveDocumentID}`); 
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
      <h1 className = 'textForPhone'>Selling Crypto</h1>
      
  
    {existingStock && !showingAmountToAdd && (
      <form onSubmit={handleSubmit}>
          <div>
            <p className = 'textForPhone'>Enter the cryptocurrency you want to sell</p>
            <label htmlFor="name"></label>
            <input
              type="text"
              id="name"
              name="name"
              value={value}
              onChange={handleInputChange}
            />
          </div>
           <div className='thisForm'>
                <button className = 'theseButtons'
                style={matchingStock ? { display: 'block' } : { display: 'none' }}
                type="submit"
                >
                Submit
                </button>
                </div>
          </form>
         )}
          {showingAmountToAdd && (
            <div>
              <div>You had {oldValue} {unitType} of {destinationStock}</div>
            <p className = 'textForPhone'>{value}</p>
            <form onSubmit={confirmAmountExistingSubtract}>
    
            <label htmlFor="name">Number of {unitType} sold:</label>
            <div>
            <input
              type="number"
              value={valueAddExist}
              onChange={changeInputAddExist}
            />
            </div>
           
            <button 
              className = 'theseButtons'
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
              <p className = 'textForPhone'>{value}</p>
              <p className = 'textForPhone'>{amountToSubtract}</p>
              <p className = 'textForPhone'>Are you sure you want to sell {amountToSubtract} of {destinationStock}?</p>
              <button className = 'theseButtons' onClick = {getStockDetails}>Yes</button>
              <button className = 'theseButtons' onClick ={backToStock}>No</button>
              <p className = 'textForPhone'>{noTradeMessage}</p>
            </div>
          )}
          {showNewValue && (
            <div>
            <p className = 'textForPhone'>You now have {newValue} {unitType} of {destinationStock}   </p>
            </div>
          )}
          {noTrade && (
            <div>
              <p className = 'textForPhone'>No trade, click Home</p>
            </div>
          )}
          <div className="titleImage-container"><img src={sell} alt="App Logo" /></div>
    </div>
  );
}



export default LetsSellCrypto;

/// setShowFinal(false)

