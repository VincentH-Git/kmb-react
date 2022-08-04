import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import Map from "./Map"
import { BsArrowLeft } from 'react-icons/bs';
import { useNavigate, useParams } from "react-router-dom";
import "../css/BusDetails.css"
import { BusListing } from "./BusListing";

interface BusStopInfo {
  lat: string;
  long: string;
  name_tc: string;
}


export default function BusDetails() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: `${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}` || "",
  });
  let navigate = useNavigate();
  let { stopId, route, direction, service } = useParams()
  // const [busRouteInfo, setBusRouteInfo] = useState([]);
  const [busRouteEta, setBusRoutesEta] = useState<Array<BusListing>>([]);
  const [busStopInfo, setBusStopInfo] = useState<BusStopInfo>()

  const fetchData = async () => {
    try {
      let res = await fetch(
        `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${service}`
      );
      let busStopEta = await res.json();
      let processedBusStopEta = []
      for (let route of busStopEta.data) {
        //calculate the time left
        let originalHour = route["data_timestamp"].split("T")[1].slice(0, 2)
        let originalMin = route["data_timestamp"].split("T")[1].slice(3, 5)
        if (route["eta"]) {
          let etaHour = route["eta"].split("T")[1].slice(0, 2)
          let etaMin = route["eta"].split("T")[1].slice(3, 5)
          if (parseInt(etaHour) < parseInt(originalHour)) {
            etaHour = `${parseInt(etaHour) + 24}`
          }
          route["timeLeft"] = ((parseInt(etaHour) - parseInt(originalHour)) * 60 + parseInt(etaMin) - parseInt(originalMin)).toString();
        } else {
          route["timeLeft"] = null
        }
        processedBusStopEta.push(route)

      }
      setBusRoutesEta(processedBusStopEta)
      console.log(processedBusStopEta)
      // let busDirection = (direction == "O") ? "outbound" : "inbound"
      let res2 = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopId}`)
      let busStop = await res2.json();
      setBusStopInfo(busStop.data)
      console.log(busStop.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [])

  if (!isLoaded) return <div>Loading...</div>;
  return (
    <div className="container">
      <div className="header">
        <BsArrowLeft color={"white"} size={"18px"} style={{ stroke: "white", strokeWidth: "1", paddingLeft: "10", paddingTop: "3" }} onClick={() => navigate("/")} />
        <div className="busNum">{route}</div>
        <div className="direction">往</div>
        {busRouteEta.length > 0 ? <div className="destination"> {busRouteEta[0].dest_tc} </div> : ""}
      </div>
      <div className="map">
        {busStopInfo ? <Map latitude={parseFloat(busStopInfo.lat)} longitude={parseFloat(busStopInfo.long)} /> : ""}
      </div>
      <div className="bottomPart">
        {busStopInfo ? <div className="busStop">{busStopInfo.name_tc} </div> : ""}
        {busRouteEta.length > 0 && busRouteEta[0].timeLeft ?
          <div className="eachRow">
            <div className="time">{busRouteEta[0].timeLeft <= "0" ? "-" : busRouteEta[0].timeLeft}</div>
            <div className="unit">分鐘</div>
            {busRouteEta.length > 1 && busRouteEta[1].timeLeft ? "" : <div className="nextText">尾班車</div>}
          </div>
          :
          <div className="eachRow">
            <div className="noShow">暫時沒有預定班次</div>
          </div>
        }
        {busRouteEta.slice(1, 3).map((each, key) => {
          return (
            each.timeLeft ?
              <div className="eachRow" key={key} >
                <div className="time">{each.timeLeft}</div>
                <div className="unit">分鐘</div>
                <div className="nextText">預定班次</div>
              </div>
              : "")
        })}

      </div>
    </div>
  );
}

