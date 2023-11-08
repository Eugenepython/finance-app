import React, { useEffect } from "react";
import {useState} from 'react';

function LetsBuyStock({dataArray}) {

const [value, setValue] = useState('');
const [destinationStock, setDestinationStock] = useState('')
const theArray = ['tesla', 'github', 'hoover']
const [newStock, setNewStock] = useState(false)
const [existingStock, setExistingStock] = useState(false)
const [matchingStock, setMatchingStock] = useState(false)
const [stockNames, setStockNames] = useState([])
const [showingAmountToAdd, setShowingAmountToAdd] = useState(false)
const [valueAddExist, setValueAddExist] = useState('');
const [amountToAdd, setAmountToAdd] = useState(0)
const [showFinal, setShowFinal] = useState(false)




function confirmAmountExistingAdd(event) {
  event.preventDefault(); 
  console.log(valueAddExist)
  setAmountToAdd(valueAddExist)
  setShowFinal(true)
  setNewStock(true)
  setShowingAmountToAdd(false)
  setExistingStock(false)
}

function changeInputAddExist(event) {
  console.log(event.target.value)
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
    console.log(dataArray[i].stockName)
    const stockName = dataArray[i].stockName
    stockName.toLowerCase()
    emptyStocks.push(stockName)
    setStockNames(emptyStocks)
  }
  }, [dataArray]);

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
}

function addExistStock() {
    setExistingStock(true)
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
              <button>Yes</button>
              <button>No</button>
            </div>
          )}


    </div>
  );
}



export default LetsBuyStock;

