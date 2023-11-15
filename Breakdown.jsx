import React from 'react';
import {useState, useContext} from 'react';
import { getAuth, signOut } from 'firebase/auth';
import Crypto from '/Crypto';
import Stocks from '/Stocks';
import { userContext, changePageContext } from '/Context';
import tinyLogo from '/src/tinyLogo.jpg';

function Breakdown({}) {  


function stringToNumber(string) {
  if (string){
  return Number(string.replace(/[^0-9.-]+/g,""))
  } else {
    return null
  }
}


  const changePage = useContext(changePageContext);
  const { setStocksTotal, totalStocks, totalCrypto, setCryptoTotal } = useContext(userContext);
  const {toBreakdown, StocksPage, CryptoPage, showBreakdown, showStocks, showCrypto} = changePage
//console.log(showStocks)



const total = stringToNumber(totalStocks) + stringToNumber(totalCrypto)

const currencyTotal = total.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


return (
        <>
    {showBreakdown && (
      <div className = 'daddy'>

      <h1>Assets Summary</h1>
        

        <div className = 'breakdown-row' onClick={StocksPage}>
          <div className= 'breakdownButton'>Stocks:</div> 
          <div className = 'summaryHolder'>{totalStocks? totalStocks : ' Click to find up to date stock market valuation'}</div>
          </div>

        <div className = 'breakdown-row' onClick = {CryptoPage}>
          <div className = 'breakdownButton'>Crypto:</div>
        <div className = 'summaryHolder'>{totalCrypto ? totalCrypto:'Click to Find current crypto value' }</div>
        </div>
        <br></br>

        <div className = 'breakdown-row'>
          <div className = 'breakdownButton'>Total:</div>
          <div className = 'summaryHolder1'> ${currencyTotal}</div>   
        </div>
        

        
          
          <img className = 'bottomImage' src={tinyLogo} alt="App Logo" />
          <p className = 'bottomTitle'>Rubrikal</p>
          
        </div>
        )}

{showStocks ? <Stocks /> : null}  
      {showCrypto && <Crypto />}
        </>
  );
}

export default Breakdown;

