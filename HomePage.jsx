import React from 'react';
import {useState, useContext} from 'react';

import Breakdown from '/Breakdown';
import { userContext, changePageContext } from '/Context';



function HomePage({logOut, auth}) {  

const changePage = useContext(changePageContext);

const {toBreakdown} = changePage

  return (
      
            <div className = 'home-page'>

<div className="banner">
<button className="home-button" onClick={toBreakdown} >Home</button>
<div className="titleImage-container">
<img src="public/editedLogo.jpg" alt="App Logo" />
</div>
<button className="logout-button" onClick={() => logOut(auth)}>Logout</button>
</div>

      

<Breakdown />
     
    </div>
  );
}

export default HomePage;








