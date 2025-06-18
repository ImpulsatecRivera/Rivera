import truck from "../../images/camion.png";

const SideImage = () => (
  <div className="w-[360px] h-auto rounded-xl overflow-hidden shadow-md">
    <img
      src={truck}
      alt="Camión Rivera"
      className="w-full h-auto object-contain"
    />
  </div>
);

export default SideImage;
