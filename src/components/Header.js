import React from 'react'
 
import Eth from '../eth.svg';
import {Link} from "react-router-dom";// Import Link from react-router for navigation
 
function Header(props) {
  // Destructure the props for easier access
  const{address,isConnected,connect}=props;
  return (

    <header>
   
      {/* Link to the homepage using react-router's Link component */}

      <Link to="/" className="link"> 
      <div className='headerItem'>Swap</div>
      </Link>
      
      
    
    <div className='rightH'>
    <div className='headerItem'>
    <img src={Eth} alt='eth' className='eth'  />Ethereum
    </div>
  <div className='connectButton' onClick={connect}>{isConnected?(address.slice(0,4)+ "..." +address.slice(38)) : "Connect"} 
    </div>
    </div>
  </header>
)
}

export default Header