import React from 'react';
import truck from "../../images/camion.png";

const SideImage = () => {
  return (
    <div className="w-[360px] h-[500px] rounded-xl overflow-hidden shadow-md">
      <img
        src={truck}
        alt="Camión Rivera"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default SideImage;
