import React, { useEffect, useContext } from "react";
import {useState} from 'react';
import firebase from 'firebase/compat/app';
import firebaseConfig from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth'
import {getFirestore, collection, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore"
import { userContext } from '/Context';
import buy from '/src/buy.jpg';

function LetsBuyCrypto({dataArray}) {

const masterCollection='cryptoCollection'
const theId = 'wrZzk7dZSKOl2rSwHUU4'

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
const [unitType, setUnitType] = useState('')
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
//console.log(dataArray)
  useEffect(() => {
  let emptyStocks = []
  for(let i = 0; i < dataArray.length; i++) {
    //console.log(dataArray[i].stockName)
    const stockName = dataArray[i].stockName
    console.log(stockName)
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
    //console.log(dataArray[i])
  const firstThree = dataArray[i].stockName.substring(0, 3)
  const firstThreeLower = firstThree.toLowerCase()
  const firstThreeLowerThree = firstThreeLower.substring(0, 3)
  const firstThreeCapped = firstThreeLowerThree.charAt(0).toUpperCase() + firstThreeLowerThree.slice(1).toLowerCase()
  const firstThreeCappedThree = firstThreeCapped.substring(0, 3)
  if (firstThree === event.target.value || firstThreeLower === event.target.value || firstThreeLowerThree === event.target.value || firstThreeCapped === event.target.value || firstThreeCappedThree === event.target.value) {
    console.log("match")
    setUnitType(dataArray[i].unitName)
    setValue(dataArray[i].stockName)
    setMatchingStock(true)
    //console.log(matchingStock)
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
  //console.log(theArray)
  const promises = theArray.map((item) => {
  const stockDetails = collection(db, `users/${uid}/${masterCollection}/${theId}/${item}`);
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(stockDetails, (snapshot) => {
        snapshot.docs.forEach((y) => {
          const subCollection = y.data();
          //console.log(subCollection.unitsHeld)
          const theElusiveDocumentID = y.id;
          //console.log(theElusiveDocumentID)
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
          //console.log(theNewTotal)
          setNewValue(theNewTotal)
          const refStock = doc(db, `users/${uid}/${masterCollection}/${theId}/${item}/${theElusiveDocumentID}`); 
            updateDoc(refStock, { unitsHeld: theNewTotal });
        } catch (error) {
          console.error('Error updating document:', error); 
        } 
      });
      //console.log(newValue)
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
  setShowFinal(false)
  showNoTrade(true)
}
const [lowerCryptoName, setLowerCryptoName] = useState('')

function addingNewStockSymbol(event){
  let input = event.target.value
  let ticker = input.toUpperCase()
  //console.log(event.target.value)
  setNewStockSymbolValue(ticker)
  setLowerCryptoName((event.target.value).toLowerCase())
}



async function confirmNewStockSymbol(event){
  event.preventDefault(); 
  //console.log(lowerCryptoName)
  let wrongArray = [];
  let pickedArray = [];
  //console.log(newStockSymbolValue)
  //console.log("one")
  try {
    //console.log(newStockSymbolValue)
    //console.log(lowerCryptoName)
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${lowerCryptoName}`)
  const data = await response.json();
  //console.log(data)
    const aTicker = data
  if (lowerCryptoName === aTicker.id) {
    //console.log(aTicker.description)
    pickedArray.push(aTicker.id)
    setUnitType(aTicker.symbol.toLowerCase())
    console.log(aTicker.symbol)
    console.log("dsafdsafdsaf!!!!!!!!!")
  } else {
    //console.log("no match")
    wrongArray.push(aTicker.id)
  }
  //console.log(pickedArray)
  let foundMatch = false;
  //console.log(pickedArray)
  //console.log(dataArray.length)
if (pickedArray.length > 0){
  //console.log(pickedArray[0])
  if (dataArray.some(item => 
    item.cryptoName === pickedArray[0]
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
  setNewStockErrorMessage("Check the ticker is correct");
  setTheNewStockName(null);
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
  let changedStockName = theNewStockName.replace(/[\/.]/g, '_');
  const modifiedStockName = changedStockName.toUpperCase();
  //console.log(modifiedStockName)
  const dataToUpdate = {
      [modifiedStockName]: 'crypto',
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
      //console.log(modifiedStockName)
      // Create a subcollection under the document
      const subcollectionRef = collection(nameRef, modifiedStockName);
      const subcollectionData = {
        platform: platformValue,
        stockName: modifiedStockName,
        stockSymbol: newStockSymbolValue,
        unitName: unitType,
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


//console.log(dataArray[0].unitName)

//console.log(unitType)
  return (
    <div>
      <h1 className = 'textForPhone'>Adding to Crypto</h1>
      {!existingStock && !newStock && !showingAmountToAdd && showInitialQuestion && (
        <div>
      <p className = 'textForPhone'>If this is a new cryptocurrency you are adding to your portfolio, click 'New coin' If already in your portfolio, click "Existing coin.'</p>
      <button className = 'theseButtons' onClick = {addNewStock}>New coin</button>
      <button className = 'theseButtons' onClick = {addExistStock}>Existing coin</button>
      </div>
      )}
    {existingStock && !showingAmountToAdd && (
      <form onSubmit={handleSubmit}>
          <div className = 'tempHolder'>
            <label htmlFor="name">Name of Cryptocurrency:</label>
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
              <p className = 'textForPhone'>Enter the crypto currency name here as recorded on Coingecko</p>
              <p className = 'textForPhone'>Make sure its not already oin your portfolio</p>
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
                <p className = 'textForPhone'>{newStockErrorMessage}</p>
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
            <button className = 'theseButtons'  onClick={confirmNewStock}>Confirm Platform and Crypto</button>
            ) : null}            
          </div>
          )}
            <p className = 'textForPhone' >{successAdd}  </p> 
          {showingAmountToAdd && (
            <div>
            <p className = 'textForPhone'>{value}</p>
            <form onSubmit={confirmAmountExistingAdd}>
            <div>
            <label htmlFor="name">How much {unitType} did you just buy?:</label>
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
              <p className = 'textForPhone'>{amountToAdd} {unitType} purchased</p>
              <p className = 'textForPhone'>Confirm adding {amountToAdd} {unitType} to {destinationStock} portfolio?</p>
              <button className = 'theseButtons'  onClick = {getStockDetails}>Yes</button>
              <button className = 'theseButtons'  onClick ={backToStock}>No</button>
            </div>
          )}
          {showNewValue && (
            <div>
            <p className = 'textForPhone'>You now have {newValue} {unitType} of {destinationStock}   </p>
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



export default LetsBuyCrypto;

/// setShowFinal(false)

