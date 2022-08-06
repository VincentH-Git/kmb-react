import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/BusListing.css';
import { BsExclamationCircle } from 'react-icons/bs';
import PullToRefresh from "react-simple-pull-to-refresh";
import { Oval } from 'react-loading-icons'


export interface BusListing {
  data_timestamp: string,
  dest_tc: string,
  eta: string,
  route: string,
  busStop: string,
  busStopId: string,
  timeLeft: string | null,
  dir: string
  service_type: string
}

export default function BusListing() {
  const [busRoutesEta, setBusRoutesEta] = useState<Array<BusListing>>([]);
  const [filteredBusRoutesEta, setFilteredBusRoutesEta] = useState<Array<BusListing>>([]);
  const [inputValue, setInputValue] = useState<string>("");

  // fetch data in every 10 seconds
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [])

  //
  useEffect(() => {
    if (inputValue.length > 0) {
      let filteredValue = busRoutesEta.filter(route => {
        let routeNumber = route.route.slice(0, inputValue.length)
        if (inputValue.toUpperCase() == routeNumber) {
          return route
        }
      })
      setFilteredBusRoutesEta(filteredValue)
    } else{
      setFilteredBusRoutesEta(busRoutesEta)
    }

  }, [inputValue, busRoutesEta])


  const fetchData = async () => {
    try {
      let busRoute: Array<BusListing> = []
      let res1 = await fetch(
        "https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/BFA3460955AC820C"
      );
      let data1: { data: Array<BusListing> } = await res1.json();
      let routeNumber: string = "";

      for (let route of data1.data) {
        if (route.route !== routeNumber) {
          route["busStop"] = "荃景圍天橋"
          route["busStopId"] = "BFA3460955AC820C"
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
          routeNumber = route.route
          busRoute.push(route)
        }
      }

      let res2 = await fetch(
        "https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/5FB1FCAF80F3D97D"
      );
      let data2: { data: Array<BusListing> } = await res2.json();
      routeNumber = "0"

      for (let route of data2.data) {
        if (route.route !== routeNumber) {
          route["busStop"] = "荃灣柴灣角街"
          route["busStopId"] = "5FB1FCAF80F3D97D"

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
          routeNumber = route.route
          busRoute.push(route)
        }
      }
      busRoute.sort((a, b) => {
        if (a.route < b.route) {
          return -1
        }
        if (a.route > b.route) {
          return 1;
        }
        return 0;
      })
      console.log(busRoute)
      setBusRoutesEta(busRoute)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchDataByScrollDown = (): Promise<void> => {
    return new Promise(res => {
      setTimeout(() => {
        res(fetchData())
      }, 900);
    });
  };

  return (
    <div className="container">
      <div className='header'>
        <div className="text">
          KMB 1933
        </div>
      </div>
      <div className="searchContainer">
        <input type="text" className="inputBar" placeholder="輸入巴士號碼" maxLength={4} value={inputValue} onChange={(event) => { setInputValue(event.target.value) }}></input>
      </div>
      <PullToRefresh onRefresh={fetchDataByScrollDown} className="pullToRefresh" pullingContent="" refreshingContent={<Oval stroke={"#656E75"} height={"24px"} />}>
        <div >
          {filteredBusRoutesEta.length > 0 ?
            filteredBusRoutesEta.map((route, key) =>
              <EachBus key={key} routeNumber={route.route} destination={route.dest_tc} busStop={route.busStop} timeLeft={route.timeLeft} busStopId={route.busStopId} direction={route.dir} service={route.service_type}></EachBus>
            )
            : ""}
        </div>
      </PullToRefresh>
    </div>
  );
}

interface Props {
  routeNumber: string,
  destination: string,
  busStop: string,
  busStopId: string,
  timeLeft: string | null,
  direction: string,
  service: string
}



function EachBus(props: Props) {
  let navigate = useNavigate();
  return (
    <div className='row' onClick={() => {

      navigate(`/${props.busStopId}/${props.routeNumber}/${props.service}/${props.direction}`)
    }}>
      <div className='busNumberContainer'>
        <div className='busNumberText'>
          {props.routeNumber}
        </div>
      </div>
      <div className='busInfoContainer'>
        <div className='upperPart'>
          <div className='label'>往</div >
          <div className='content'>
            {props.destination}
          </div >
        </div>
        <div className='LowerPart'>
          <div>{props.busStop}</div>
        </div>
      </div>
      {props.timeLeft ?
        <div className='nextBusContainer'>
          <div className='time'>{props.timeLeft <= "0" ? "-" : props.timeLeft}</div>
          <div className="label">分鐘</div>
        </div> :
        <div className='nextBusContainer'>
          <div className='exclamationContainer'>
            <BsExclamationCircle size={26} />
          </div>
        </div>
      }

    </div>)
}
