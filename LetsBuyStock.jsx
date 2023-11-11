import React, { useEffect, useContext } from "react";
import {useState} from 'react';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth'
import {getFirestore, collection, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { userContext } from '/Context';


function LetsBuyStock({dataArray}) {

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

const [showNewValue, setShowNewValue] = useState(false)
const [newValue, setNewValue] = useState(0)
const [noTrade, showNoTrade] = useState(false)


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
    setDestinationStock(value)
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

function addNewStock() {
    setNewStock(true)
    console.log("hello")
}

function addExistStock() {
    setExistingStock(true)
}

const singleArray = [destinationStock]

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
          console.log(subCollection.unitsHeld)
          const theElusiveDocumentID = y.id;
          //setOldValue(parseFloat(subCollection.unitsHeld))
            //console.log(oldValue)
           const theOldValue = subCollection.unitsHeld
           console.log(typeof theOldValue) // this is a number which is good
            const numberToAdd = parseFloat(amountToAdd)
            console.log(typeof numberToAdd)
           const addedAmount = Number(numberToAdd.toFixed(3));
        const theNewTotal = (addedAmount + theOldValue)
        //console.log(theElusiveDocumentID)
        try {
          //console.log('Item:', item);
//console.log('UID:', uid);
//console.log('Document Path:', `users/${uid}/stocks/ClZGlMuH1YdA9tGzp2tT/${item}`);
//console.log('New Value:', newValue);  
          setNewValue(theNewTotal)
          const refStock = doc(db, `users/${uid}/stocks/ClZGlMuH1YdA9tGzp2tT/${item}/${theElusiveDocumentID}`); // Error updating document: TypeError: doc2 is not a function
            updateDoc(refStock, { unitsHeld: theNewTotal });
        } catch (error) {
          console.error('Error updating document:', error); 
        } 
      });
      unsubscribe(); // Unsubscribe from the listener
      resolve(); // Resolve the promise
    }, (error) => {
      console.error('Error fetching data:', error);
  });
  });
});
await Promise.all(promises);
//console.log(newValue)
}


function getStockDetails() {
    queryStocksDetails(singleArray)
    
    setShowFinal(false)
    setShowNewValue(true)
  //console.log(singleArray)
  // g back to the home page
}

function backToStock(){
  console.log("hello")
  setShowFinal(false)
  showNoTrade(true)
}


//console.log(dataArray[0].stockName)
  return (
    <div>
      <h1>LetsBuyStock</h1>
      
      {!existingStock && !newStock && !showingAmountToAdd && (
        <div>
      <p>New stock or adding to existing stock?</p>
      <button onClick = {addNewStock}>New</button>
      <button onClick = {addExistStock}>Existing</button>
      </div>
      )}
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
          {newStock && (
             <div>
              <p>look for a new stock</p>
             </div>
          
          )}



          {showingAmountToAdd && (
            <div>
            <p>{value}</p>
            <form onSubmit={confirmAmountExistingAdd}>
            <div>
            <label htmlFor="name">Amount in shares:</label>
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
            </div>
          )}

          {showFinal && (
            <div>
              <p>{value}</p>
              <p>{amountToAdd}</p>
              <p>Are you sure you want to add {amountToAdd} to {destinationStock}?</p>
              <button onClick = {getStockDetails}>Yes</button>
              <button onClick ={backToStock}>No</button>
            </div>
          )}
          {showNewValue && (
            <div>
            <p>You now have {newValue} shares of {destinationStock}   </p>
            </div>
          )}
          {noTrade && (
            <div>
              <p>No trade was made, press Home to go back</p>
            </div>
          )}
    </div>
  );
}



export default LetsBuyStock;

/// setShowFinal(false)

