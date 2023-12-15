import React, { useState, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut } from 'firebase/auth'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, onSnapshot } from "firebase/firestore"
import { userContext, changePageContext } from '/Context';
import HomePage from '/HomePage';
import Layout from './Layout';
import firebaseConfig from "/firebaseConfig";
import Logo from '/src/Logo.jpg';
import finnHub from '/src/finnHub.png';
import coinGecko from '/src/coinGecko.png';
import lightBule from '/src/lightBule.jpg';



function Signin({ }) {

  const [showBreakdown, setShowBreakdown] = useState(true)
  const [showStocks, setShowStocks] = useState(false)
  const [showCrypto, setShowCrypto] = useState(false)
  const [totalStocks, setStocksTotal] = useState(null)
  const [totalCrypto, setCryptoTotal] = useState(null)


  function StocksPage() {
    //console.log("stocks")
    setShowBreakdown(false)
    setShowStocks(true);
    setShowCrypto(false);
  }

  function CryptoPage() {
    ///console.log("crypto")
    setShowBreakdown(false)
    setShowStocks(false);
    setShowCrypto(true);
  }
  function toBreakdown() {
    //console.log("breakdown")
    setShowBreakdown(true)
    setShowStocks(false);
    setShowCrypto(false);
  }

  const [userObject, setUserObject] = useState({ uid: null, displayName: null, photoURL: null, })
  const [userID, setUserID] = useState(null)
  const [continueToHome, setContinueToHome] = useState(false)


  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);;
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [message, setMessage] = useState('')
  const [signInMessage, setSignInMessage] = useState('')

  useState(() => {
    onAuthStateChanged(auth, user => {
      if (user == null) {
        console.log("user is null")
        setMessage("Incorect username or password")
        return
      }
      //console.log(user.accessToken)
      const { uid } = user;
      setUserObject({
        uid: uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      setUserID(uid)
    })
  }), [auth]


  async function signOutAndSetUserToNull(auth, user) {
    try {
      await signOut(auth)
      console.log(userObject.displayName + ' has been signed out.');
      user = null;
      setUserObject({ uid: null, displayName: null, photoURL: null, })
      setContinueToHome(false)
    }
    catch (error) {
      console.error('Error signing out:', error);
      console.log(auth)
    }
  }

  //console.log(userObject)
  function logIn() {
    //console.log("logging in")
    signInWithRedirect(auth, new GoogleAuthProvider())
  }

  function createStream(y) {
    return onSnapshot(y, snapshot => {
      snapshot.docs.map(doc => console.log(doc.data()))
    });
  }

  //console.log(userObject)

  //userObject.uid == null ? logIn() : console.log("user is logged in")
  //userObject.displayName
  //userObject.photoURL
  function conTinue() {
    //console.log("hello")
    setContinueToHome(true)
  }
  //console.log(userObject)
  return (
    <div>

      {continueToHome ? null : (
        <div className='sign-in-page'>
          {userObject.displayName ? null : (
            <div className='container'>
              <h1 className='firstTitle'>Rubrikal</h1>
              <h1>Track your finances here</h1>
              <p className='textForPhone'>In collaboration with Coingecko and Finnhub </p>
              <img src={coinGecko} alt='coinGecko' className='companyLogo' />
              <img src={finnHub} alt='finnHub' className='companyLogo' />
              <p className="firstText">Sign in with Google</p>
              <div>
                <button className='googleImage' onClick={logIn}>       </button>
              </div>
              <img className='logoSignIn' src={Logo} alt="Logo" />


            </div>
          )}

          {userObject.displayName ? (
            <div >
              <h1 className='secondTitle'>Rubrikal</h1>
              <h2 className="secondText">{userObject.displayName}</h2>
              <img src={userObject.photoURL} alt="User" />

              <p className="secondText">Welcome!</p>
              {userObject.displayName ? <button className='cocktail-button' onClick={conTinue}>Continue</button> : null}
              <img className='logoBlue' src={lightBule} alt="Logo" />
            </div>
          ) : null}
        </div>
      )}


      <userContext.Provider value={{ userObject, setStocksTotal, totalStocks, totalCrypto, setCryptoTotal }}>
        <changePageContext.Provider value={{ toBreakdown, StocksPage, CryptoPage, showBreakdown, showStocks, showCrypto }}>


          {continueToHome ? (
            <HomePage logOut={signOutAndSetUserToNull} auth={auth} />
          ) : null}

        </changePageContext.Provider>
      </userContext.Provider>


    </div>
  );
}

export default Signin;

