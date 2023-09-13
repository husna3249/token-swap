import React,{useState,useEffect} from 'react'
import {Input,Popover,Radio,Modal,message} from "antd"
import{ArrowDownOutlined,DownOutlined,SettingOutlined,} from "@ant-design/icons";
import tokenList from "../tokenList.json";
 
import axios from "axios";
import{useSendTransaction,useWaitForTransaction} from "wagmi";
 
function Swap(props) {
  // Destructure props
  const {address,isConnected}=props;
   // State and instance for Ant Design's message component
  const[messageApi,contextHolder]= message.useMessage();
  const [slippage,setSlippage]=useState(2.5);
  const [tokenOneAmount,setTokenOneAmount]=useState(null);
  const[tokenTwoAmount,setTokenTwoAmount]=useState(null);
  const [tokenOne,setTokenOne]=useState(tokenList[8]);
  const [tokenTwo,setTokenTwo]=useState(tokenList[2]);
const [isOpen,setIsOpen]=useState(false);
const[changeToken,setChangeToken]=useState(1);
const [prices,setPrices]=useState(null);
const[txDetails,setTxDetails]=useState({
  to:null,
  data:null,
  value:null,
});

// Hooks from "wagmi" library to handle transaction sending and monitoring
const {data,sendTransaction}=useSendTransaction({
  request :{
from:address,
to:String(txDetails.to),
data:String(txDetails.data),
value:String(txDetails.value),
  }
})
const{isLoading, isSuccess} = useWaitForTransaction({
  hash : data?.hash,

})
// Function to handle slippage change
function handleSlippageChange(e){
    setSlippage(e.target.value);
  }

   // Function to update the token amounts
function changeAmount(e){
    setTokenOneAmount(e.target.value);
    if(e.target.value && prices){
      setTokenTwoAmount((e.target.value* prices.ratio).toFixed(2))
    }
    else{
      setTokenTwoAmount(null)
    }
  }

  
  // Function to switch the two tokens

  function switchTokens(){
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one=tokenOne;
    const two=tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address,one.address)
  }


  // Function to open the token selection modal
function openModal(asset){
  setChangeToken(asset);
  setIsOpen(true);
}
  // Function to modify the selected token
function modifyToken(i){
  setPrices(null);
  setTokenOneAmount(null);
  setTokenTwoAmount(null);
  if(changeToken ===1){
    setTokenOne(tokenList[i]);
    fetchPrices(tokenList[i].address,tokenTwo.address);
  }
  else{
    setTokenTwo(tokenList[i]);
    fetchPrices(tokenOne.address,tokenList[i].address);
  }
setIsOpen(false);
}

 // Function to fetch the prices of the tokens
async function fetchPrices(one,two){
  const res =await axios.get('http://localhost:3001/tokenPrice',{
    params :{addressOne :one,addressTwo:two}
  })
   
  setPrices(res.data);
}


async function fetchDexSwap() {
  const apiKey = "Your_1inch_API";

  // Construct the proxy URL for the allowance check
  const allowanceUrl = `http://localhost:3002/proxy?url=${encodeURIComponent(`https://api.1inch.dev/swap/v5.2/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}&api_key=${apiKey}`)}`;

  try {
    const allowanceResponse = await axios.get(allowanceUrl);
    if (allowanceResponse.data.allowance === "0") {
      // Construct the proxy URL for the approval transaction
      const approveUrl = `http://localhost:3002/proxy?url=${encodeURIComponent(`https://api.1inch.dev/swap/v5.2/1/approve/transaction?tokenAddress=${tokenOne.address}&amount=100000000000&api_key=${apiKey}`)}`;
      
      const approveResponse = await axios.get(approveUrl);
      setTxDetails(approveResponse.data);
      console.log("not approved");
      return;
    }
const tx = await axios.get(`http://localhost:3002/proxy?url=${encodeURIComponent(`https://api.1inch.dev/swap/v5.2/1/swap?src=${tokenOne.address}&dst=${tokenTwo.address}&amount=${tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length,'0')}&from=${address}&slippage=${slippage}&api_key=${apiKey}`)}`)

let decimals= Number(`1E${tokenTwo.decimals}`)
setTokenTwoAmount((Number(tx.data.toTokenAmount)/decimals).toFixed(2));
setTxDetails(tx.data.tx);
 
  }
  
  catch (error) {
    console.error("Error in fetchDexSwap:", error);
    // Handle the error
  }
}

  // UseEffect hooks to handle side effects
useEffect(()=>{
  fetchPrices(tokenList[0].address,tokenList[1].address)
},[])
useEffect(()=>{
  if(txDetails.to && isConnected){
    sendTransaction();
  }
},[txDetails]);
 
useEffect(()=>{
  messageApi.destroy();
  if(isLoading){
    messageApi.open({
    type: 'loading',
    content: 'Transaction is pending',
    duration: 0 ,
    })
  }
  },[isLoading])

  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: '1.5',
      })
    }else if(txDetails.to){
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: '1.50',
      })
    }
  },[isSuccess])

  // Settings for the slippage tolerance popover
  const settings =(
    <>
    <div>Sliggpage Tolerance</div>
    <div><Radio.Group value={slippage} onChange={handleSlippageChange}>
      <Radio.Button value={0.5}>0.5%</Radio.Button>
      <Radio.Button value={2.5}>2.5%</Radio.Button>
      <Radio.Button value={5}>5%</Radio.Button>
      </Radio.Group></div>
      </>
  )

  
  // Render the component
  return (
 <>
 {contextHolder}
 <Modal open={isOpen}
 footer={null}
 onCancel={()=>setIsOpen(false)}
 title="select a token" 
 >
<div className='modalContent' >
  {tokenList?.map((e,i)=>{

return(
  <div
   className='tokenChoice'
   key={i}
   
  onClick={()=>modifyToken(i)}
  > 
    <img src={e.img} alt={e.ticker} className='tokenLogo'/>
    <div className='tokenChoiceNames'>
      <div className='tokenName'>{e.name}</div>
      <div className='tokenTicker'>{e.ticker}</div>
    </div>
</div>
)
})} 
</div>
 </Modal>
 
    <div className='tradeBox'>
    <div className='tradeBoxHeader'>
      <h4>Swap</h4>

      <Popover 
      content={settings}
       title="settings" 
      trigger="click"
       placement='bottomRight'>

      <SettingOutlined className='cog'/>
      </Popover>
    </div>
    <div className='inputs'>
<Input placeholder='0' value={tokenOneAmount} onChange={changeAmount}
 
/>
<Input placeholder='0'value={tokenTwoAmount} disabled={true}/>

<div className='switchButton' onClick={switchTokens}>
  <ArrowDownOutlined className='switchArrow' />
</div>
<div className='assetOne' onClick={()=>openModal(1)}> 
<img src={tokenOne.img} alt="assetOneLogo" className='assetLogo' />
{tokenOne.ticker} 
<DownOutlined />

</div>
<div className='assetTwo' onClick={()=>openModal(2)}>
<img src={tokenTwo.img} alt="assetTwoLogo" className='assetLogo' />
{tokenTwo.ticker} 
<DownOutlined />

</div>
    </div>
    <div className='swapButton' disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}
    >Swap</div>
     </div>
     </>
  )
}

export default Swap