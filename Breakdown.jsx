import React from 'react';
import {useState, useContext} from 'react';
import { getAuth, signOut } from 'firebase/auth';
import Crypto from '/Crypto';
import Stocks from '/Stocks';
import { userContext, changePageContext } from '/Context';

function Breakdown({}) {  

  let theStocks = 500
  let theCrypto = 400
  let Total = theStocks + theCrypto

  const changePage = useContext(changePageContext);
  const {toBreakdown, StocksPage, CryptoPage, showBreakdown, showStocks, showCrypto} = changePage
//console.log(showStocks)

return (
        <>
    {showBreakdown && (
        <div className="breakdown-container">
        <div className = 'breakdown-row'onClick={StocksPage}><button>Stocks:</button> {theStocks}</div>

        <div className = 'breakdown-row' onClick = {CryptoPage}><button>Crypto:</button> {theCrypto}</div>
        <div className = 'breakdown-row'><div>Total: </div>{Total}</div>
        <div>Signficant movements</div>   
        </div>
        )}

{showStocks ? <Stocks /> : null}  
      {showCrypto && <Crypto />}
        </>
  );
}

export default Breakdown;

