import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../css/BusListing.css';

export default function BusListing() {
  let navigate = useNavigate();
  let { id } = useParams()
  return (
    <div className="container">
      <div className='row'>
        <div className='busNumberContainer'>
          <div className='busNumberText'>
            40
          </div>
        </div>
        <div className='busInfoContainer'>
          <div className='upperPart'>
            <div className='label'>往</div >
            <div className='content'>荃灣(麗城花園)</div >
          </div>
          <div className='LowerPart'>
            <div>荃景園天橋</div>
          </div>
        </div>
        <div className='nextBusContainer'>
          <div className='time'>16</div>
          <div className="label">分鐘</div>
        </div>
      </div>
    </div>
  );
}
