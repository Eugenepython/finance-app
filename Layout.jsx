function Layout({logOut, auth}){
    return (
      <div className = 'home-page'>

    <div className="banner">
    <a className="home-button" >Home</a>
    <div className="titleImage-container">
    <img src="public/editedLogo.jpg" alt="App Logo" />
    </div>
    <button className="logout-button" onClick={() => logOut(auth)}>Logout</button>
    </div>
    </div>
    );
  }
  
  export default Layout;