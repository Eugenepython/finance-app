import React, { useEffect, useContext } from "react";
import {useState} from 'react';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth'
import {getFirestore, collection, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore"
import { userContext } from '/Context';
import buy from '/src/buy.jpg';


function LetsBuyStock({dataArray}) {

  const masterCollection='rightStocks'
  const theId = 'QKjEqBTHxMEU1VEPzh2p'
  const apiKey = 'cl8aoi9r01qqqm023ln0cl8aoi9r01qqqm023lng'
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);
const user = useContext(userContext);
const uid = user.userObject.uid
const [value, setValue] = useState('');
const [destinationStock, setDestinationStock] = useState(null)
const theArray = ['tesla', 'github', 'hoover']
const [newStock, setNewStock] = useState(false)
const [existingStock, setExistingStock] = useState(false)
const [matchingStock, setMatchingStock] = useState(false)
const [stockNames, setStockNames] = useState([])
const [showingAmountToAdd, setShowingAmountToAdd] = useState(false)
const [valueAddExist, setValueAddExist] = useState('');
const [amountToAdd, setAmountToAdd] = useState(0)
const [showFinal, setShowFinal] = useState(false)
const [theNewStockName, setTheNewStockName]= useState(null)
const [showNewValue, setShowNewValue] = useState(false)
const [newValue, setNewValue] = useState(0)
const [noTrade, showNoTrade] = useState(false)
const [newStockNameValue, setNewStockNameValue] = useState('');
const [newStockSymbolValue, setNewStockSymbolValue] = useState('');
const [showConfirm, setShowConfirm] = useState(false)
const [showAddToNewStock, setShowAddToNewStock] = useState(false)
const [showInitialQuestion, setShowInitialQuestion] = useState(true)
const [platformValue, setPlatformValue] = useState('');
const [oldValue, setOldValue] = useState(0)
const [newStockErrorMessage, setNewStockErrorMessage] = useState('');
const [successAdd, setSuccessAdd] = useState(null)


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
 


function confirmAmountExistingAdd(event) {
  event.preventDefault(); 
  //console.log(valueAddExist)
  setAmountToAdd(valueAddExist)
  //console.log(valueAddExist)
  setShowFinal(true)
  setNewStock(true)
  setShowingAmountToAdd(false)
  setExistingStock(false)
}

function changeInputAddExist(event) {
 // console.log(event.target.value)
  setValueAddExist(event.target.value)
}


function handleSubmit(event) {
    event.preventDefault();
    //console.log('You clicked submit.');
    //console.log(value);
    let capitalString = value.toUpperCase();
    setDestinationStock(capitalString)
    setValue('');
    setExistingStock(false)
    setShowingAmountToAdd(true)
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

function addNewStock() {
   // setNewStock(true)
    //console.log("hello")
    setShowAddToNewStock(true)
    setShowInitialQuestion(false)
    
}



function addExistStock() {
    setExistingStock(true)
}

const singleArray = [destinationStock]

//console.log(dataArray)
async function queryStocksDetails(theArray) {
  const cappedArray = []
  for (let i=0; i < theArray.length; i++) {
   const eachItem = theArray[i]
  const capppedItem = eachItem.replace(/[\/.]/g, '_');
    cappedArray.push(capppedItem)
  }
  //console.log(cappedArray)
  const promises = cappedArray.map((item) => {
  const stockDetails = collection(db, `users/${uid}/${masterCollection}/${theId}/${item}`);
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
        snapshot.docs.forEach((y) => {
          const subCollection = y.data();
          //console.log(subCollection.unitsHeld)
          const theElusiveDocumentID = y.id;
          console.log(theElusiveDocumentID)
          //setOldValue(parseFloat(subCollection.unitsHeld))
            //console.log(oldValue)
           const theOldValue = subCollection.unitsHeld
           setOldValue(theOldValue)
          // console.log(typeof theOldValue) // this is a number which is good
            const numberToAdd = parseFloat(amountToAdd)
            //console.log(typeof numberToAdd)
           const addedAmount = Number(numberToAdd.toFixed(3));
        const theNewTotal = (addedAmount + theOldValue)
        //console.log(theElusiveDocumentID)
        try {
          //console.log('Item:', item);
//console.log('UID:', uid);
//console.log('Document Path:', `users/${uid}/stocks/ClZGlMuH1YdA9tGzp2tT/${item}`);
//console.log('New Value:', newValue);  
          console.log(theNewTotal)
          setNewValue(theNewTotal)
          const refStock = doc(db, `users/${uid}/${masterCollection}/${theId}/${item}/${theElusiveDocumentID}`); 
            updateDoc(refStock, { unitsHeld: theNewTotal });
        } catch (error) {
          console.error('Error updating document:', error); 
        } 
      });
      console.log(newValue)
      unsubscribe(); // Unsubscribe from the listener
      resolve(); // Resolve the promise
    }, (error) => {
      console.error('Error fetching data:', error);
  });
  });
});
await Promise.all(promises);
console.log(newValue)
}


function getStockDetails() {
    queryStocksDetails(singleArray)
    
    setShowFinal(false)
    setShowNewValue(true)
  //console.log(singleArray)
  // g back to the home page
}

function backToStock(){
  setShowFinal(false)
  showNoTrade(true)
}


function addingNewStockSymbol(event){
  let input = event.target.value
  let ticker = input.toUpperCase()
  //console.log(event.target.value)
  setNewStockSymbolValue(ticker)
}


async function confirmNewStockSymbol(event){
  event.preventDefault(); 
  let wrongArray = [];
  let pickedArray = [];
  //console.log(newStockSymbolValue)
  //console.log("one")
  try {
    //console.log(newStockSymbolValue)
const response = await fetch(`https://finnhub.io/api/v1/search?q=${newStockSymbolValue}&token=${apiKey}`);
  const data = await response.json();
  for (let i = 0; i < data.result.length; i++) {
    const aTicker = data.result[i]
  if (newStockSymbolValue === aTicker.symbol) {
    //console.log(aTicker.description)
    pickedArray.push(aTicker.description)
    //console.log("two")
  } else {
    //console.log("no match")
    wrongArray.push(aTicker.description)
  }}
  //console.log(pickedArray)
  let foundMatch = false;
  //console.log(pickedArray)
  //console.log(dataArray.length)

if (pickedArray.length > 0){
  //console.log(pickedArray[0])
  if (dataArray.some(item => 
    item.stockName === pickedArray[0]
    )) {
    setTheNewStockName(null);
    setShowConfirm(false);
    console.log("Ticker already recorded");
    setNewStockErrorMessage("Ticker already recorded");
  } else {
    setTheNewStockName(pickedArray[0]);
    setShowConfirm(true);
    setNewStockErrorMessage("");
  }
} else {
  console.log("nothing was entered ")
  setTheNewStockName(null);
  setNewStockErrorMessage("Check the ticker is correct, or not already in your portfolio");
}
  } catch (error) {
    console.log(error)
  }
  //console.log("four")
  pickedArray = []
}



async function confirmNewStock() {
  //console.log("confirm identiy of new stock")
  setDestinationStock(theNewStockName)
  setShowAddToNewStock(false)
  //console.log(newStockSymbolValue + " " + theNewStockName)
  const nameRef = doc(db, `users/${uid}/${masterCollection}/${theId}`);
  //console.log(typeof theNewStockName)
  const modifiedStockName = theNewStockName.replace(/[\/.]/g, '_');
  const dataToUpdate = {
      [modifiedStockName]: 'stock',
    }
    try {
      await updateDoc(nameRef, dataToUpdate);
      console.log('Document updated successfully.');
      setSuccessAdd("Successfully added to your portfolio, click Home and back to this section to update value of portfoilo")
    } catch (error) {
      console.error('Error updating document:', error);
    }
    //console.log(destinationStock)
    //console.log(modifiedStockName)
    //console.log(platformValue)
    //console.log(newStockSymbolValue)
    try {
      await updateDoc(nameRef, dataToUpdate);
      //console.log('Document updated successfully.');
  
      // Create a subcollection under the document
      const subcollectionRef = collection(nameRef, modifiedStockName);
      const subcollectionData = {
        platform: platformValue,
        stockName: modifiedStockName,
        stockSymbol: newStockSymbolValue,
        unitName: 'shares',
        unitsHeld: 0,
      };
  
      await addDoc(subcollectionRef, subcollectionData);
      //console.log('Subcollection created successfully.');
    } catch (error) {
      console.error('Error updating document:', error);
    }
}

function addingPlatform(event){
  setPlatformValue(event.target.value)
}



function confirmAmountSharesNewStock(event) {
  event.preventDefault();
  //console.log(valueAddExist)
  setAmountToAdd(valueAddExist)
  //console.log(destinationStock)

  //const stockDetails = collection(db, `users/${uid}/${masterCollection}/${theId}/${item}`);
    //  const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
    //    snapshot.docs.forEach((y) => {
    //      const subCollection = y.data();
  
    //      const theElusiveDocumentID = y.id;
    //      console.log(theElusiveDocumentID)

    //        const numberToAdd = parseFloat(amountToAdd)
    //        console.log(typeof numberToAdd)
    //       const addedAmount = Number(numberToAdd.toFixed(3))
   //     })
}


//const [showInitialQuestion, setShowInitialQuestion] = useState(true)


  return (
    <div>
      <h1 className = 'textForPhone'>Adding to Stock</h1>
      {!existingStock && !newStock && !showingAmountToAdd && showInitialQuestion && (
        <div>
      <p className = 'textForPhone'>If this is a new stock you are adding to your portfolio, click 'New stock.' If already in your portfolio, click "Existing stock.'</p>
      <button className = 'theseButtons' onClick = {addNewStock}>New stock</button>
      <button className = 'theseButtons' onClick = {addExistStock}>Existing stock</button>
      </div>
      )}
    {existingStock && !showingAmountToAdd && (
      <form onSubmit={handleSubmit}>
          <div className = 'tempHolder'>
            <label htmlFor="name">Name of Stock:</label>
            <input
            className = 'tempInput'
              type="text"
              id="name"
              name="name"
              value={value}
              onChange={handleInputChange}
            />
          
                <button className = 'theseButtons1'
                style={matchingStock ? { display: 'block' } : { display: 'none' }}
                type="submit"
                >
                Submit
                </button>
                </div>
          </form>
         )}
       
          { showAddToNewStock && (
             <div>
              <p className = 'textForPhone'>Enter the stock ticker here</p>
              <form onSubmit={confirmNewStockSymbol}>
          <div>
            <label htmlFor="name">Ticker:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newStockSymbolValue}
              onChange={addingNewStockSymbol}
            />
          </div>
                <button 
                className = 'theseButtons' 
                type="submit"
                >
                Submit
                </button>
                <p>{newStockErrorMessage}</p>
          </form>
          {theNewStockName ? <p className = 'textForPhone'>{theNewStockName}</p> : null}
          {theNewStockName ?
          <div>
          <p className = 'textForPhone'>What platform are you using to buy {theNewStockName}?</p>
          <form onSubmit={confirmNewStock}>
               <input
              type="text"
              name="namePlatform"
              value={platformValue}
              onChange={addingPlatform}
            />
          </form>
          </div>
        : null}
            {showConfirm && platformValue.length > 0 ? (
            <button className = 'theseButtons'  onClick={confirmNewStock}>Confirm Platform and Stock</button>
            ) : null}        
          </div>
          )}
          <p className = 'textForPhone' >{successAdd}  </p> 
          {showingAmountToAdd && (
            <div>
            <p className = 'textForPhone'>{value}</p>
            <form onSubmit={confirmAmountExistingAdd}>
            <div>
            <label htmlFor="name">How many shares did you just buy?:</label>
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
            </div>
          )}

          {showFinal && (
            <div>
              <p className = 'textForPhone'>{value}</p>
              <p className = 'textForPhone'>{amountToAdd} shares purchased</p>
              <p className = 'textForPhone'>Confirm adding {amountToAdd} shares to {destinationStock} portfolio?</p>
              <button className = 'theseButtons'  onClick = {getStockDetails}>Yes</button>
              <button className = 'theseButtons'  onClick ={backToStock}>No</button>
            </div>
          )}
          {showNewValue && (
            <div>
            <p className = 'textForPhone'>You now have {newValue} shares of {destinationStock}   </p>
            <p className = 'textForPhone'>Click 'Home' to go back</p>
            </div>
          )}
          {noTrade && (
            <div>
              <p className = 'textForPhone'>No trade was made, press Home to go back</p>
            </div>
          )}
          <div className="titleImage-container"><img src={buy} alt="App Logo" /></div>
    </div>
  );
}



export default LetsBuyStock;

/// setShowFinal(false)




