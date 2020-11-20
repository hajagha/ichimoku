const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
const ichimoku = require('ichimoku');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const coins = ["BTCUSDT", "LINKUSDT", "XRPUSDT", "EOSUSDT", "BCHUSDT", "ETHUSDT"
, "LTCUSDT", "BNBUSDT", "TRXUSDT", "DOTUSDT", "ADAUSDT"];

const shitcoins = ["YFIUSDT", "SUSHIUSDT", "CRVUSDT", "ETCUSDT", "SXPUSDT", "YFIIUSDT", "UNIUSDT", "AAVEUSDT", "WAVESUSDT"
, "ATOMUSDT", "BANDUSDT", "COMPUSDT", "DEFIUSDT", "VETUSDT", "DASHUSDT", "IOTAUSDT","ALGOUSDT", "XMRUSDT", "XLMUSDT", "XTZUSDT"]

const shiiiiiitcoins = ["RSRUSDT", "TRBUSDT", "BZRXUSDT", "RUNEUSDT", "RLCUSDT",
 "THETAUSDT", "ZILUSDT", "KAVAUSDT", "AVAXUSDT", "ZECUSDT"]





const binanceConfig = {
  API_KEY: 'YDneln48yl6Iqowx8pRJGLUkEF44sLphFhS6rtscc3SBfEUVRmxLm4oN82H2NypS',
  API_SECRET: 'Z6k6Ur37zGnzOUgWEeIyFEY5FCM2WNuGFNOH7DC7nA4B8qG8iVYIXxuFJPL9Q0Uk',
  HOST_URL: 'https://fapi.binance.com',
};

let CandelList = []
// sleep in ms timeframe
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const buildSign = (data, config) => {
  return crypto.createHmac('sha256', config.API_SECRET).update(data).digest('hex');
};

const privateRequest = async (data, endPoint, type) => {
  const dataQueryString = qs.stringify(data);
  
  const signature = buildSign(dataQueryString, binanceConfig);
  const requestConfig = {
    method: type,
    url: binanceConfig.HOST_URL + endPoint + '?' + dataQueryString + '&signature=' + signature,
    headers: {
       "X-MBX-APIKEY": binanceConfig.API_KEY,
    },
  };

  try {
    
    const response = await axios(requestConfig);
    
    return response;
  }
  catch (err) {
    
    return err;
  }
};

const publicRequest = async (data , endPoint , type) => {
  const dataQueryString = qs.stringify(data)

  const requestConfig ={
    method : type,
    url : binanceConfig.HOST_URL + endPoint + '?' + dataQueryString
  }

  try {
    
    const response = await axios(requestConfig);
    
    return response;
  }
  catch (err) {
    
    return err;
  }

}

let prvPrice = 0

const getSymbolPriceFake =async (symbol) => {
  const data = {
    symbol : symbol
  }

  res=await publicRequest(data , '/fapi/v1/premiumIndex' , 'GET')
  if(res.data == undefined)
  {
    const pp = {
      price : prvPrice
    }
    return pp
  }

  prvPrice = res.data.price
  
  return res.data

}


const getSymbolPrice =async (symbol) => {
  const data = {
    symbol : symbol
  }

  res=await publicRequest(data , '/fapi/v1/ticker/price' , 'GET')
  if(res.data == undefined)
  {
    const pp = {
      price : prvPrice
    }
    return pp
  }

  prvPrice = res.data.price
  
  return res.data

}


const setTradeOrder = async(symbol , side , positionSide ,  quantity , price ) =>{

  const data = {
    symbol: symbol,
    side : side,
    quantity : quantity,
    price : price,
    timestamp: Date.now(),
    type : "LIMIT",
    timeInForce : "GTC",
    positionSide : positionSide
  };
  

  res=await privateRequest(data , '/fapi/v1/order' , 'POST')
  if(res.response != undefined && res.response.status == 400)
  {
    
    return res.response.data
  }
  else{
    
    return res.data
  }
  
}

const cancelAllOpenOrders = async(symbol) =>{
  const data ={
    symbol : symbol,
    timestamp :Date.now()
  }
}


const cancleOrderById = async(symbol , orderId)=>{
  const data ={
    symbol : symbol,
    orderId : orderId,
    timestamp :Date.now()
  }

  res=await privateRequest(data , '/fapi/v1/order' , 'DELETE')
  if(res.response != undefined && res.response.status == 400)
  {
    
    return res.response.data
  }
  else{
    
    return res.data
  }
}



const changeSymbolLeverage = async(symbol , leverage) => {
  const data = {
    symbol : symbol ,
    leverage : leverage,
    timestamp: Date.now()
  }

  res=await privateRequest(data , '/fapi/v1/leverage' , 'POST')
  if(res.response != undefined && res.response.status == 400)
  {
    
    return res.response.data
  }
  else{
    
    return res.data
  }
}

const changePositionType = async (type)=>{
  const data = {
    dualSidePosition : type,
    timestamp: Date.now()
  }
  res=await privateRequest(data , '/fapi/v1/positionSide/dual' , 'POST')
  if(res.response != undefined && res.response.status == 400)
  {
    
    return res.response.data
  }
  else{
    
    return res.data
  }
}


const getCandleBarData = async (symbol , interval) => {
  const data ={
    symbol : symbol,
    interval : interval,
    limit : 150
  }
  let res = await publicRequest(data , '/fapi/v1/klines' , 'GET')
  
  if(res.response != undefined && res.response.status == 400)
  {
    
    return res.response.data
  }
  else{
    
     return res.data
    
    
  }
}



const getOpenPostitions = async (symbol)=>{
  data = {
    symbol : symbol,
    timestamp: Date.now()
  }
  let res=await privateRequest(data , '/fapi/v2/positionRisk' , 'GET')
  if(res.response != undefined && res.response.status == 400)
  {
    
    return res.response.data
  }
  else{
    
    return res.data
  }
}




const main = async()=>{
 
  ////// setting leverage to *4
  
  /////initiation phase

  let price = await getSymbolPrice("BNBUSDT")
  price=price.price
  price = price 
  console.log(price)
  let UpperPrice =parseFloat(price)+1
  
  let res = await setTradeOrder("BNBUSDT" , "BUY" , "BOTH" , "0.01" , UpperPrice)
  
  let trade = {
    entryPrice : price,
    orderId : res.orderId,
    side : res.side,
    quantity : 0.01
  }
  console.log('initiation phase')
  console.log(trade)
  //
  // /checking the takeProfit and action Phase
  while(true)
  {
   
    let curPrice = await getSymbolPrice("BNBUSDT")

    
    let distance = curPrice.price- trade.entryPrice
    distance = (distance/trade.entryPrice) * 2 * 100
    console.log(`distance : ${distance}`)
    if(trade.side == "BUY" && distance >= 0.24 )
    {
      console.log('phase 1')
      let price = await getSymbolPrice("BNBUSDT")
      price=price.price
      UpperPrice =parseFloat(price)+1

      let res = await setTradeOrder("BNBUSDT" , "BUY" , "BOTH" , "0.01" , UpperPrice)
      trade.entryPrice = price
      trade.orderId = res.orderId
      trade.side = res.side
      trade.quantity = trade.quantity + 0.01
      console.log(trade)
      
    }
    else if(trade.side == "BUY" && distance <= -0.08){
      console.log('phase 2')
      let price = await getSymbolPrice("BNBUSDT")
      price=price.price
      UpperPrice =parseFloat(price)-1

      let res = await setTradeOrder("BNBUSDT" , "SELL" , "BOTH" , trade.quantity , UpperPrice)
      console.log(trade)
      ////action getPosition reverseMode

      price = await getSymbolPrice("BNBUSDT")
      price = price.price
      UpperPrice =parseFloat(price)-1

      res = await setTradeOrder("BNBUSDT" , "SELL" , "BOTH" , "0.01" , UpperPrice )
      trade.entryPrice = price,
      trade.orderId = res.orderId,
      trade.side = res.side ,
      trade.quantity = 0.01
      console.log(trade)
     
    }
    else if(trade.side == "SELL" && distance <= -0.24)
    {
      console.log('phase 3')
      let price = await getSymbolPrice("BNBUSDT")
      price=price.price
      UpperPrice =parseFloat(price)-1

      let res = await setTradeOrder("BNBUSDT" , "SELL" , "BOTH" , "0.01" , UpperPrice)
      trade.entryPrice = price
      trade.orderId = res.orderId
      trade.side = res.side
      trade.quantity = trade.quantity + 0.01
      console.log(trade)
      
    }
    else if(trade.side == "SELL" && distance >= 0.08)
    {
      console.log('phase 4')
      let price = await getSymbolPrice("BNBUSDT")
      price=price.price
      UpperPrice =parseFloat(price)+1
      console.log(trade)
      let res = await setTradeOrder("BNBUSDT" , "BUY" , "BOTH" , trade.quantity , UpperPrice)

      price = await getSymbolPrice("BNBUSDT")
      price= price.price
      UpperPrice =parseFloat(price)+1

      //// reverseMode action

      res = await setTradeOrder("BNBUSDT" , "BUY" , "BOTH" , "0.01" , UpperPrice)
      trade.entryPrice = price
      trade.orderId = res.orderId
      trade.quantity = 0.01
      trade.side = res.side
      console.log(trade)
    
    }
    
  }



  }

  
///////////ichimoku
const conversionLine = async() =>{
    let candles = await getCandleBarData('BNBUSDT' , "1h")
    candles = candles.reverse()
    
    let i =0 
    let k = 0
    
    let partial = []
    let conversionLine = []
    for(k; k <42+50 ; k++)
    {
      let low = 123131
    let high = 0
      for(i = k+1 ; i<k+9 ; i++ )
      {
        
        // partial.push(candles[i])
        if(candles[i][4] > high)
        {
          high = candles[i][4]
        }else if(candles[i][4] < low)
        {
          low = candles[i][4]
        }
        
      }

      conversionLine.push((parseFloat(low) + parseFloat(high)).toFixed(4)/2)

  }
  return conversionLine

}



const baseLine = async() =>{
  let candles = await getCandleBarData('BNBUSDT' , "1h")
  candles = candles.reverse()

  
  let i =0 
  let k = 0
  
  let partial = []
  let baseLine = []
  for(k; k <25 +50 ; k++)
  {
    let low = 123131
  let high = 0
    for(i = k+1 ; i<k+26 ; i++ )
    {
      
      // partial.push(candles[i])
      if(candles[i][4] > high)
      {
        high = candles[i][4]
      }else if(candles[i][4] < low)
      {
        low = candles[i][4]
      }
      
    }

    baseLine.push((parseFloat(low) + parseFloat(high)).toFixed(4)/2)

}
return baseLine

}



const laggingSpan =async () =>{
  let candles = await getCandleBarData('BNBUSDT' , "1h")
  candles = candles.reverse()

  let laggingSpan = []
  for(let i =0 ; i<100 ; i++)
  {
    laggingSpan.push(parseFloat(candles[i][4]).toFixed(4) )
  }

  return laggingSpan

}


const getMovingAverage = async (period) =>{
  let candles = await getCandleBarData('BNBUSDT' , "1h")
  candles = candles.reverse()

  
  let i =0 
  let k = 109
  
  let partial = []
  let baseLine = []
  for(k; k >0 ; k--)
  {
    let low = 123131
  let high = 0
    for(i = k ; i<k+26 ; i++ )
    {
      
      // partial.push(candles[i])
      if(candles[i][4] > high)
      {
        high = candles[i][4]
      }else if(candles[i][4] < low)
      {
        low = candles[i][4]
      }
      
    }

    baseLine.push((parseFloat(low) + parseFloat(high)).toFixed(4)/2)

}
return baseLine
}


const aSpan = async () =>{
  let BaseLine = await baseLine()
  let ConversionLine = await conversionLine()
  let aSpan = []
  console.log('kir')
  for(let i = 65 ; i>0 ; i--)
  {
    let a = (BaseLine[i] + ConversionLine[i])/2
    a= parseFloat(a).toFixed(4)
    console.log(BaseLine[i] , ConversionLine[i] , a)
    aSpan.push(a)
  }

  return aSpan
}

  const ichimokuIndicator = async (symbol  , interval)=>{
    let candles  = await getCandleBarData(symbol , interval)
    let conv = []
    let base = []
    let span_a = []
    let span_b = []
    let factors =[]
    
   
    const ICH = new ichimoku({
      conversionPeriod : 9,
      basePeriod       : 26,
      spanPeriod       : 52,
      displacement     : 26,
      values           : []
    })

    for( let candle of candles ) {
      
      let ichimokuValue = ICH.nextValue({
          high  : candle[2],
          low   : candle[3],
          close : candle[4]
      })

      if(ichimokuValue != undefined)
      {
        factors.push(ichimokuValue)
        conv.push(ichimokuValue.conversion)
        base.push(ichimokuValue.base)
        span_a.push(ichimokuValue.spanA)
        span_b.push(ichimokuValue.spanB)
      }
    
      
    }

    factors.pop()
    factors = factors.reverse()
    conv.pop()
    conv = conv.reverse()
    base.pop()
    base = base.reverse()
    span_a.pop()
    span_a = span_a.reverse()
    span_b.pop()
    span_b = span_b.reverse()
    
   
    let lastCandlesConv = []
    let lastCandlesBase = []

    lastCandlesBase.push(base[0])
    lastCandlesBase.push(base[1])

    lastCandlesConv.push(conv[0])
    lastCandlesConv.push(conv[1])

    ////check if 2 lines colided

    let startingPoint = conv[1] - base[1]
    let enddingPoint = conv[0] - base[0]
    
    
    if(startingPoint*enddingPoint <0)
    {
      //colided

      if(startingPoint <=0)
      {
        //buy signal
        //check if price is in cloud
        let CANDLE = candles.reverse()
        let preC= []
        preC.push(CANDLE[1])
        preC.push(CANDLE[2])
        //console.log(preC[0] , preC[1] , span_b[0] , span_a[0] , conv[0] , conv[1])

        ///if is over cloud
        if(conv[0]> span_a[0] && conv[0] > span_b[0] && conv[1]> span_a[1] && conv[1]> span_b[1]   &&    base[0]> span_a[0] && base[0] > span_b[0] && base[1]> span_a[1] && base[1]> span_b[1])
        {

          //if price is over cloud
          if(preC[0][3] >= span_a[0] && preC[0][3] >= span_b[0] && preC[1][3] >= span_a[1] && preC[1][3] >= span_b[1] )
          {
            return "strong buy"
          }
          return "Weak buy"
        }
        else {
          return "False alarm"
        }
        

        

      }else if(startingPoint > 0)
      {
        //sell signal
        //check if price is in cloud
        let CANDLE = candles.reverse()
        let preC= []
        preC.push(CANDLE[1])
        preC.push(CANDLE[2])
        //console.log("candle 0",preC[0][3] ,"candle 1" ,preC[1][3] ,"span_a0",span_a[0] ,"span_a1" ,span_a[1],"span_b0" , span_b[0] ,"span_b1" , span_b[1] ,"span_a1" , conv[0] , conv[1])

        ///if is bellow cloud
        if(conv[0]< span_a[0] && conv[0] < span_b[0] && conv[1]< span_a[1] && conv[1]< span_b[1]    &&   base[0]< span_a[0] && base[0] < span_b[0] && base[1]< span_a[1] && base[1]< span_b[1])
        {
          //if price is bellow cloud
          if(preC[0][2] <= span_a[0] && preC[0][2] <= span_b[0] && preC[1][2] <= span_a[1] && preC[1][2] <= span_b[1] )
          {
            return "strong sell"
          }
          return "Weak sell"
        }else {
          return "False alarm"
        }
        
      }

       
    }else{
      return "nothing"
    }


    
    

  }

let watching = async () => {
  while (true){
    // for Coins
    const signal = []
    for(let i=0; i<coins.length; i++){
      const res = await ichimokuIndicator(coins[i] , "1m" )
      console.log("symbol : " + coins[i] + '\t' + "action : " + res)
      if (res != "nothing"){
        signal.push({symbol : coins[i], action : res})
      }
  }
    // for Shitcoins
    for(let i=0; i<shitcoins.length; i++){
      const res = await ichimokuIndicator(shitcoins[i] , "1m" )
      console.log("symbol : " + shitcoins[i] + '\t'+ "action : " + res)
      if (res != "nothing"){
        signal.push({symbol : shitcoins[i], action : res})
      }
    }
    // for Shiiiiitcoins
    for(let i=0; i<shiiiiiitcoins.length; i++){
      const res = await ichimokuIndicator(shiiiiiitcoins[i] , "1m" )
      console.log("symbol : " + shiiiiiitcoins[i] + '\t' + "action : " + res)
      if (res != "nothing"){
        signal.push({symbol : shiiiiiitcoins[i], action : res})
      }
      }

      
  console.log(signal)
  await sleep(60000);

}
}
watching()