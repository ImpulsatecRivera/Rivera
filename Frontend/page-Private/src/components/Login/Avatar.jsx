import avatar from "../../images/avatar.png";

const Avatar = () => (
  <div className="flex justify-center mb-6">
    <img
      src={avatar}
      alt="avatar"
      className="w-28 h-28 object-contain"
    />
  </div>
);

export default Avatar;