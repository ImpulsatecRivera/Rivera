import React, { useState, useEffect } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import Lottie from 'lottie-react';
import avatarImg from '../../images/avatarDashboard.png';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('Inicio');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingItem, setAnimatingItem] = useState('');
  const [pendingRoute, setPendingRoute] = useState(null);
  // Estados para responsividad
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);

  const { logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado separado SOLO para logout (no se mezcla con animación de navegación)
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  // Datos del archivo Lottie
  const lottieData = {"v":"4.8.0","meta":{"g":"LottieFiles AE 3.4.5","a":"","k":"","d":"","tc":""},"fr":30,"ip":0,"op":40,"w":460,"h":460,"nm":"icon 6","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"path","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":0,"s":[661.957,373.194,0],"to":[0,0,0],"ti":[0,0,0]},{"t":39,"s":[-210.043,373.194,0]}],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[-22.242,0],[-53.217,0],[0,0]],"o":[[0,0],[43.83,0],[23.932,0],[0,0],[0,0]],"v":[[-670.478,6.51],[48.913,6.51],[131.87,-6.51],[221.87,6.51],[670.478,6.51]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0.247058823705,0.247058823705,0.247058823705,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":9,"ix":5},"lc":1,"lj":1,"ml":10,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":56,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"1st wheel","parent":4,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"t":40,"s":[720]}],"ix":10},"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":15,"s":[131.82,118.252,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":19,"s":[131.82,103.252,0],"to":[0,0,0],"ti":[0,0,0]},{"t":23,"s":[131.82,118.252,0]}],"ix":2},"a":{"a":0,"k":[361.82,348.252,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[15.234,0],[0,15.228]],"o":[[-15.224,0],[0,-15.236]],"v":[[13.808,27.616],[-13.808,0.001]],"c":false},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0.239196777344,0.239196777344,0.239196777344,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":10,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[348.005,348.254],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[-0.003,-18.488]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,-10.2],[10.199,0],[0,10.195],[-10.192,0]],"o":[[10.199,0],[0,10.195],[-10.192,0],[0,-10.2],[0,0]],"v":[[-0.003,-18.488],[18.493,0],[-0.003,18.488],[-18.492,0],[-0.003,-18.488]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.701960980892,0.701960980892,0.701960980892,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[361.818,348.254],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[0.002,-35.951]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,-19.821],[19.824,0],[0,19.824],[-19.829,0]],"o":[[19.824,0],[0,19.824],[-19.829,0],[0,-19.821],[0,0]],"v":[[0.002,-35.951],[35.952,0.002],[0.002,35.951],[-35.952,0.002],[0.002,-35.951]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.305882006884,0.305882006884,0.305882006884,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[361.82,348.252],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[361.82,348.252],"ix":2},"a":{"a":0,"k":[361.82,348.252],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":2,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":56,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"2nd wheel","parent":4,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"t":40,"s":[720]}],"ix":10},"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":23,"s":[-64.836,118.252,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":28,"s":[-64.836,100.252,0],"to":[0,0,0],"ti":[0,0,0]},{"t":34,"s":[-64.836,118.252,0]}],"ix":2},"a":{"a":0,"k":[165.164,348.252,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[-15.234,0],[0,-15.228]],"o":[[15.224,0],[0,15.236]],"v":[[-13.808,-27.616],[13.808,-0.001]],"c":false},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0.239196777344,0.239196777344,0.239196777344,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":10,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[178.98,348.25],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[0.003,18.488]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,10.2],[-10.199,0],[0,-10.195],[10.192,0]],"o":[[-10.199,0],[0,-10.195],[10.192,0],[0,10.2],[0,0]],"v":[[0.003,18.488],[-18.493,0],[0.003,-18.488],[18.493,0],[0.003,18.488]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.701960980892,0.701960980892,0.701960980892,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[165.166,348.25],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[-0.002,35.951]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,19.821],[-19.824,0],[0,-19.824],[19.829,0]],"o":[[-19.824,0],[0,-19.824],[19.829,0],[0,19.821],[0,0]],"v":[[-0.002,35.951],[-35.952,-0.002],[-0.002,-35.951],[35.952,-0.002],[-0.002,35.951]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.305882006884,0.305882006884,0.305882006884,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[165.164,348.252],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[165.164,348.252],"ix":2},"a":{"a":0,"k":[165.164,348.252],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":2,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":56,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"body","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":0,"s":[230,229,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":5,"s":[230,230,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":10,"s":[230,229,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":15,"s":[230,230,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":19,"s":[230,226,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":23,"s":[230,230,0],"to":[0,0,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":28,"s":[230,228,0],"to":[0,0,0],"ti":[0,0,0]},{"t":34,"s":[230,230,0]}],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[147.547,12.379]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[1.074,0.613],[0.621,-1.074],[0,0],[-1.074,-0.621],[-0.621,1.074]],"o":[[0.625,-1.074],[-1.07,-0.625],[0,0],[-0.618,1.074],[1.082,0.617],[0,0]],"v":[[147.547,12.379],[146.723,9.313],[143.649,10.129],[134.567,25.864],[135.391,28.938],[138.465,28.114]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.501960813999,0.960784316063,1,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[138.414,7.106]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[1.078,0.621],[0.625,-1.07],[0,0],[-1.07,-0.618],[-0.625,1.074]],"o":[[0.621,-1.07],[-1.074,-0.621],[0,0],[-0.613,1.074],[1.082,0.621],[0,0]],"v":[[138.414,7.106],[137.59,4.032],[134.512,4.856],[125.43,20.59],[126.254,23.661],[129.332,22.84]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.501960813999,0.960784316063,1,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[152.469,-6.289]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0],[0,7.355],[0,0],[-1.735,0]],"o":[[0,0],[0,0],[-7.36,0],[0,0],[0,-1.734],[0,0]],"v":[[152.469,-6.289],[170.973,39.25],[115.36,39.25],[102.016,25.911],[102.016,-3.144],[105.153,-6.289]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.639215707779,1,1,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 3","np":3,"cix":2,"bm":0,"ix":3,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[191.852,63.618]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0],[0,6.914],[-6.906,0]],"o":[[0,0],[0,0],[-6.906,0],[0,-6.91],[0,0]],"v":[[191.852,63.618],[191.852,88.684],[179.168,88.684],[166.637,76.153],[179.168,63.618]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[1,1,0,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 4","np":3,"cix":2,"bm":0,"ix":4,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[152.469,-6.289]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0],[0,7.355],[0,0],[-1.735,0]],"o":[[0,0],[0,0],[-7.36,0],[0,0],[0,-1.734],[0,0]],"v":[[152.469,-6.289],[170.973,39.25],[115.36,39.25],[102.016,25.911],[102.016,-3.144],[105.153,-6.289]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ind":2,"ty":"sh","ix":3,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0.136,2.382],[14.265,0],[0.825,-14.223],[2.379,0],[0,0],[0,2.484],[0,0],[-5.878,0],[0,0],[-1.089,-2.691],[0,0],[0,-11.992],[0,0],[12.808,0]],"o":[[0,0],[-2.383,0],[-0.825,-14.223],[-14.266,0],[-0.132,2.382],[0,0],[-2.481,0],[0,0],[0,-5.879],[0,0],[6.696,0],[0,0],[11.691,1.457],[0,0],[0,12.812],[0,0]],"v":[[168.61,120.903],[163.223,120.903],[158.731,116.661],[131.821,91.293],[104.91,116.661],[100.426,120.903],[72.653,120.903],[68.153,116.403],[68.153,-5.464],[78.824,-16.128],[141.781,-16.128],[152.117,-7.152],[171.391,40.293],[191.852,63.348],[191.852,97.661],[168.61,120.903]],"c":true},"ix":2},"nm":"Path 3","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.96862745285,0.57647061348,0.117647059262,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 5","np":4,"cix":2,"bm":0,"ix":5,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":5,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[72.653,120.903]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0.132,2.382],[14.266,0],[0.824,-14.223],[2.383,0],[0,0],[0,7.383],[0,0],[-7.387,0],[0,0],[0,-2.484],[0,0],[2.484,0]],"o":[[0,0],[-2.387,0],[-0.825,-14.223],[-14.257,0],[-0.144,2.382],[0,0],[-7.387,0],[0,0],[0,-7.386],[0,0],[2.484,0],[0,0],[0,2.484],[0,0]],"v":[[72.653,120.903],[-33.441,120.903],[-37.933,116.661],[-64.844,91.293],[-91.746,116.661],[-96.238,120.903],[-111.472,120.903],[-124.867,107.508],[-124.867,67.422],[-111.472,54.028],[72.653,54.028],[77.153,58.52],[77.153,116.403],[72.653,120.903]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.882352948189,0.466666668653,0.0941176489,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":5,"ty":4,"nm":"hanging ","parent":7,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":15,"s":[0]},{"i":{"x":[0.667],"y":[0.833]},"o":{"x":[0.333],"y":[0]},"t":24,"s":[-10]},{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[-0.5]},"t":32,"s":[5]},{"t":40,"s":[0]}],"ix":10},"p":{"a":0,"k":[-165.307,-126.117,0],"ix":2},"a":{"a":0,"k":[64.693,103.883,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[0.005,-18.693]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,-10.305],[-10.312,0],[0,10.312],[10.305,0]],"o":[[-10.312,0],[0,10.312],[10.305,0],[0,-10.305],[0,0]],"v":[[0.005,-18.693],[-18.693,-0.006],[0.005,18.693],[18.693,-0.006],[0.005,-18.693]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.701960980892,0.701960980892,0.701960980892,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[65.693,103.693],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[0.005,27.693]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,15.273],[-15.269,0],[0,-15.27],[15.27,0]],"o":[[-15.269,0],[0,-15.262],[15.27,0],[0,15.273],[0,0]],"v":[[0.005,27.693],[-27.693,-0.006],[0.005,-27.693],[27.693,-0.006],[0.005,27.693]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.501960992813,0.501960992813,0.501960992813,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[65.693,103.693],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[65.693,103.693],"ix":2},"a":{"a":0,"k":[65.693,103.693],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[0.005,43.189]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,14.242],[-2.48,0],[0,-2.481],[-9.285,0],[0,9.277],[9.278,0],[0,2.48],[0,0],[-2.492,0],[0,-2.484],[0,0],[0,-12.703],[14.235,0]],"o":[[-14.242,0],[0,-2.481],[2.485,0],[0,9.277],[9.278,0],[0,-9.278],[-2.492,0],[0,0],[0,-2.484],[2.481,0],[0,0],[12.105,2.133],[0,14.242],[0,0]],"v":[[0.005,43.189],[-25.827,17.365],[-21.327,12.865],[-16.827,17.365],[0.005,34.197],[16.835,17.365],[0.005,0.537],[-4.495,-3.963],[-4.495,-38.689],[0.005,-43.189],[4.499,-38.689],[4.499,-8.069],[25.827,17.365],[0.005,43.189]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.501960992813,0.501960992813,0.501960992813,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[65.693,165.576],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":56,"st":0,"bm":0},{"ddd":0,"ind":6,"ty":4,"nm":"Layer 2","parent":4,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[-23.857,0.758,0],"ix":2},"a":{"a":0,"k":[206.143,230.758,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[0.002,-18.693]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,-10.305],[-10.313,0],[0,10.312],[10.304,0]],"o":[[-10.313,0],[0,10.312],[10.304,0],[0,-10.305],[0,0]],"v":[[0.002,-18.693],[-18.697,-0.002],[0.002,18.693],[18.697,-0.002],[0.002,-18.693]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.701960980892,0.701960980892,0.701960980892,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[206.143,196.19],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[0.003,27.693]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,15.269],[-15.27,0],[0,-15.27],[15.269,0]],"o":[[-15.27,0],[0,-15.27],[15.269,0],[0,15.269],[0,0]],"v":[[0.003,27.693],[-27.689,-0.002],[0.003,-27.693],[27.689,-0.002],[0.003,27.693]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.501960992813,0.501960992813,0.501960992813,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[206.142,196.19],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[206.142,196.19],"ix":2},"a":{"a":0,"k":[206.142,196.19],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":2,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[41.588,27.961]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,2.48],[0,0],[-2.488,0],[0,0],[0,-2.48],[0,0],[2.484,0]],"o":[[0,0],[-2.488,0],[0,0],[0,-2.48],[0,0],[2.484,0],[0,0],[0,2.48],[0,0]],"v":[[41.588,27.961],[-41.588,27.961],[-46.088,23.461],[-46.088,-23.461],[-41.588,-27.961],[41.588,-27.961],[46.088,-23.461],[46.088,23.461],[41.588,27.961]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.501960992813,0.501960992813,0.501960992813,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[206.143,265.059],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[15.195,18.531]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,2.484],[0,0],[-1.605,0.738],[-1.328,-1.156],[-4.508,0],[-3.399,2.95],[-1.605,-0.726],[0,-1.762],[0,0],[2.481,0]],"o":[[0,0],[-2.484,0],[0,0],[0,-1.762],[1.606,-0.726],[3.398,2.95],[4.5,0],[1.328,-1.156],[1.606,0.738],[0,0],[0,2.484],[0,0]],"v":[[15.195,18.531],[-15.196,18.531],[-19.696,14.039],[-19.696,-14.031],[-17.062,-18.129],[-12.25,-17.43],[0.001,-12.855],[12.246,-17.43],[17.062,-18.129],[19.695,-14.031],[19.695,14.039],[15.195,18.531]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.407842993736,0.407842993736,0.407842993736,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[206.144,227.559],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false},{"ty":"tr","p":{"a":0,"k":[206.144,227.559],"ix":2},"a":{"a":0,"k":[206.144,227.559],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 2","np":2,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":56,"st":0,"bm":0},{"ddd":0,"ind":7,"ty":4,"nm":"arm","parent":4,"sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":15,"s":[0]},{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":20,"s":[-3]},{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":25,"s":[3]},{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":30,"s":[-3]},{"t":34,"s":[0]}],"ix":10},"p":{"a":0,"k":[-23.5,-33,0],"ix":2},"a":{"a":0,"k":[-23.5,-33,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0]],"o":[[0,0]],"v":[[-36.679,-23.625]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ind":1,"ty":"sh","ix":2,"ks":{"a":0,"k":{"i":[[0,0],[0.758,0.52],[0,0],[0.054,1.426],[-1.117,0.89],[0,5.711],[0.457,1.637],[-1.527,1.094],[-1.559,-1.055],[0,0],[0.301,-1.734],[1.695,-0.449],[1.266,-7.07],[1.402,-0.594],[0.585,0]],"o":[[-0.891,0],[0,0],[-1.183,-0.805],[-0.059,-1.422],[4.457,-3.571],[0,-1.699],[-0.504,-1.816],[1.539,-1.102],[0,0],[1.457,0.992],[-0.293,1.73],[-6.954,1.875],[-0.269,1.5],[-0.563,0.23],[0,0]],"v":[[-36.679,-23.625],[-39.215,-24.406],[-170.34,-110.476],[-172.304,-114.027],[-170.625,-117.714],[-163.613,-132.312],[-164.293,-137.336],[-162.586,-142.187],[-157.433,-142.257],[-17.367,-50.117],[-15.461,-45.644],[-18.722,-42.054],[-32.254,-27.332],[-34.937,-23.976],[-36.679,-23.625]],"c":true},"ix":2},"nm":"Path 2","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"fl","c":{"a":0,"k":[0.600000023842,0.600000023842,0.600000023842,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Group 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":56,"st":0,"bm":0}],"markers":[]};

  // Componente Lottie Animation
  const LottieAnimation = () => (
    <div className="lottie-container">
      <Lottie 
        animationData={lottieData}
        style={{ width: 60, height: 60 }}
        loop={true}
        autoplay={true}
      />
    </div>
  );

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsTabletCollapsed(false);
      } else if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize(); // ajusta al montar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', route: '/dashboard' },
    { id:'viajes',name: 'Viajes', route: '/viajes' },
    { id:'cotizaciones',name: 'Cotizaciones', route: '/cotizaciones' },
    {id:'Empleados', name: 'Empleados', route: '/empleados' },
    { id:'Motoristas',name: 'Motoristas', route: '/motoristas' },
    { id:'Proveedores',name: 'Proveedores', route: '/proveedores' },
    { id:'Camiones',name: 'Camiones', route: '/camiones' },
    { id:'clientes',name: 'Clientes', route: '/clientes' },
  ];

  const handleNavClick = (event, itemName, route) => {
    // Si ya estamos en esa ruta, no hacer nada
    if (location.pathname === route) {
      event.preventDefault();
      return;
    }

    // Si hay animación en curso, bloquear
    if (isAnimating) {
      event.preventDefault();
      console.log('Navegación bloqueada - animación en curso');
      return;
    }
    
    // Prevenir navegación inmediata
    event.preventDefault();
    
    // Guardar la ruta destino
    setPendingRoute(route);
    setIsAnimating(true);
    setAnimatingItem(itemName);
    
    // Ejecutar animación y después navegar
    setTimeout(() => {
      setActiveItem(itemName);
      setIsAnimating(false);
      setAnimatingItem('');
      
      // Navegar DESPUÉS de la animación
      const next = pendingRoute || route; // usa pending si existe
      navigate(next, { replace: false });
      setPendingRoute(null);
      console.log(`Navegando a: ${itemName} - ${next}`);
    }, 2000);
  };

  const handleLogout = async () => {
    // ya NO bloqueamos por isAnimating; solo evitamos doble clic de logout
    if (isLogoutLoading) {
      console.log('Logout ya en progreso…');
      return;
    }

    console.log('Cerrando sesión…');
    setIsLogoutLoading(true);
    setAnimatingItem('Cerrar sesión');

    try {
      await logOut(); // borra cookies (server + UI)
      setIsMobileMenuOpen(false); // cerrar menú móvil si estaba abierto
      navigate("/", { replace: true }); // replace para evitar back al dashboard
    } catch (error) {
      console.error("Error en cierre de sesión:", error);
    } finally {
      setIsLogoutLoading(false);
      setAnimatingItem('');
    }
  };

  // Funciones para responsividad
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTabletCollapse = () => {
    setIsTabletCollapsed(!isTabletCollapsed);
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white hover:bg-gray-700 transition-colors shadow-lg"
        style={{ backgroundColor: '#34353A' }}
        aria-label="Abrir menú"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
          h-screen text-white flex flex-col transition-all duration-300 ease-in-out
          w-64 sm:w-72 md:w-64 lg:w-64
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isTabletCollapsed ? 'md:w-16' : ''}
        `}
        style={{ backgroundColor: '#34353A' }}
      >
        <style>{`
          .menu-button {
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
          }
          
          .menu-button.disabled {
            pointer-events: none !important;
            opacity: 0.4 !important;
            cursor: not-allowed !important;
          }
          
          .menu-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 0.5rem;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
          }
          
          .menu-button:not(.disabled):hover::before {
            opacity: 1;
          }
          
          .menu-button:not(.disabled):hover {
            transform: translateX(8px) scale(1.02);
            box-shadow: 
              0 10px 25px rgba(0, 0, 0, 0.3),
              0 0 20px rgba(59, 130, 246, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border-left: 3px solid #3B82F6;
          }
          
          .menu-button.active {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.1));
            border-left: 3px solid #60A5FA;
            box-shadow: 
              0 8px 20px rgba(0, 0, 0, 0.2),
              0 0 15px rgba(59, 130, 246, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          
          .menu-text {
            position: relative;
            z-index: 2;
            font-weight: 500;
            letter-spacing: 0.025em;
          }
          
          .logout-button {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .logout-button.disabled {
            pointer-events: none !important;
            opacity: 0.4 !important;
            cursor: not-allowed !important;
          }

          /* estado visual para logout cargando */
          .logout-button.loading {
            pointer-events: none !important;
            opacity: 0.6 !important;
            cursor: wait !important;
          }
          
          .logout-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          .logout-button:not(.disabled):hover::before {
            left: 100%;
          }
          
          .logout-button:not(.disabled):hover {
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid #EF4444;
            transform: translateX(4px);
            box-shadow: 0 6px 15px rgba(239, 68, 68, 0.2);
          }
          
          .lottie-animation-container {
            position: absolute;
            top: 50%;
            left: -80px;
            transform: translateY(-50%);
            animation: lottieMove 5s ease-in-out;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          }
          
          @keyframes lottieMove {
            0% {
              left: -80px;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: calc(100% + 20px);
              opacity: 0;
            }
          }
          
          .smoke-trail {
            position: absolute;
            top: 50%;
            left: -10px;
            transform: translateY(-50%);
            width: 2px;
            height: 2px;
            background: #9CA3AF;
            border-radius: 50%;
            opacity: 0;
            animation: smokeTrail 2s ease-out;
          }
          
          .smoke-trail:nth-child(2) {
            animation-delay: 0.1s;
          }
          
          .smoke-trail:nth-child(3) {
            animation-delay: 0.2s;
          }
          
          .smoke-trail:nth-child(4) {
            animation-delay: 0.3s;
          }
          
          .smoke-trail:nth-child(5) {
            animation-delay: 0.4s;
          }
          
          @keyframes smokeTrail {
            0% {
              opacity: 0;
              transform: translateY(-50%) scale(0);
            }
            20% {
              opacity: 0.6;
              transform: translateY(-50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-60px) scale(1.5);
              background: #D1D5DB;
            }
          }

          /* Estilos responsivos agregados */
          @media (min-width: 768px) and (max-width: 1023px) {
            .sidebar-tablet.collapsed .menu-text:not(.collapsed-text),
            .sidebar-tablet.collapsed .profile-img,
            .sidebar-tablet.collapsed .logout-text {
              opacity: 0;
              pointer-events: none;
            }
          }
        `}</style>

        {/* Botón de colapso para tablet */}
        <button
          onClick={toggleTabletCollapse}
          className="hidden md:flex lg:hidden absolute -right-3 top-4 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full items-center justify-center text-white transition-colors z-10"
          aria-label="Colapsar menú"
        >
          <Menu size={14} />
        </button>

        {/* Profile Section */}
        <div className={`flex items-center justify-center transition-all duration-300 ${isTabletCollapsed ? 'py-4 px-2' : 'py-4 sm:py-6 lg:py-8 px-4'}`}>
          <img
            src={avatarImg}
            alt="Avatar"
            className={`profile-img rounded-full object-cover mx-auto transition-all duration-300 ${
              isTabletCollapsed ? 'w-8 h-8' : 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24'
            }`}
          />
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 mt-2 sm:mt-4 lg:mt-6 transition-all duration-300 ${isTabletCollapsed ? 'px-2' : 'px-3 sm:px-4'}`}>
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <li key={item.name} className="relative">
                <NavLink
                  to={item.route}
                  onClick={(e) => handleNavClick(e, item.name, item.route)}
                  className={({ isActive }) =>
                    `menu-button w-full text-left rounded-lg relative overflow-hidden block transition-all duration-300 ${
                      isActive ? 'active text-white opacity-100' : 'text-gray-300 opacity-75'
                    } ${isAnimating ? 'disabled' : 'cursor-pointer'} ${
                      isTabletCollapsed ? 'px-2 py-2 text-center' : 'px-3 sm:px-4 py-2 sm:py-3'
                    }`
                  }
                  title={isTabletCollapsed ? item.name : ''}
                >
                  <span 
                    className={`menu-text transition-opacity duration-300 ${
                      animatingItem === item.name ? 'opacity-30' : 'opacity-100'
                    } ${isTabletCollapsed ? 'text-xs collapsed-text' : 'text-sm sm:text-base'}`}
                  >
                    {isTabletCollapsed ? item.name.charAt(0).toUpperCase() : item.name}
                  </span>

                  {/* Animación de Lottie - solo si no está colapsado */}
                  {animatingItem === item.name && !isTabletCollapsed && (
                    <>
                      <div className="lottie-animation-container">
                        <LottieAnimation />
                      </div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                      <div className="smoke-trail"></div>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className={`border-t transition-all duration-300 ${isTabletCollapsed ? 'p-2' : 'p-3 sm:p-4'}`} style={{ borderColor: '#4A4B50' }}>
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            title={isTabletCollapsed ? 'Cerrar Sesión' : ''}
            className={`logout-button w-full flex items-center text-gray-300 rounded-lg opacity-75 transition-all duration-300 ${
              isLogoutLoading ? 'loading' : 'cursor-pointer'
            } ${isTabletCollapsed ? 'px-2 py-2 justify-center' : 'px-3 sm:px-4 py-2 sm:py-3'}`}
          >
            <LogOut size={isTabletCollapsed ? 16 : 20} className={isTabletCollapsed ? '' : 'mr-2 sm:mr-3'} />
            <span className={`logout-text transition-opacity duration-300 ${isTabletCollapsed ? 'hidden' : 'text-sm sm:text-base'}`}>
              {isLogoutLoading ? 'Cerrando…' : 'Cerrar Sesión'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarNav;