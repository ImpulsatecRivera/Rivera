import camionImg from '../../images/camion.png';

const SideImage = () => {
  return (
    <div className="relative w-full h-full min-h-[600px] lg:min-h-screen flex items-center justify-center p-8">
      <img 
        src={camionImg} 
        alt="Camión Rivera" 
        className="max-w-lg w-full h-auto object-contain drop-shadow-2xl"
      />
    </div>
  );
};

export default SideImage;